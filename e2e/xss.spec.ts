import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { expect, field, tab, test } from "./fixtures.ts";

/**
 * Payload stored as title of the `other/xss/xss-title` page
 */
const title = `"><strong style="color: var(--color-red-700)">Malicious string</strong><img onerror="alert('XSS: Page title')" src="x">`;

/**
 * Payload of the last option in `options.json`
 */
const option = `<img src="x" onerror="alert('xss')">`;

const ok = "This is OK";

/**
 * Checks that none of the payloads has been rendered as HTML.
 * Alert dialogs from executed payloads are caught by the
 * `errors` fixture and fail the test anyway.
 */
const expectNoInjection = async (page: Page) => {
	await expect(page.locator('strong[style*="color-red"]')).toHaveCount(0);
	await expect(page.locator('img[src="x"]')).toHaveCount(0);

	// wherever the malicious string shows up, it has to be the
	// escaped markup, not the text of a rendered `<strong>` element
	const rendered = await page.evaluate(() => {
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT
		);
		const found: string[] = [];

		while (walker.nextNode()) {
			const node = walker.currentNode;
			const text = node.textContent ?? "";

			// skip the Panel state and other non-rendered text
			if (node.parentElement?.closest("script, style, template") !== null) {
				continue;
			}

			// the writer content is sanitized, not escaped (see writer test)
			if (text.includes("hopefully sanitized") === true) {
				continue;
			}

			if (
				text.includes("Malicious string") &&
				text.includes("<strong") === false
			) {
				found.push(text);
			}
		}

		return found;
	});

	expect(rendered).toEqual([]);
};

/**
 * Checks that the element shows the green `This is OK` HTML
 */
const expectRendered = async (locator: Locator) => {
	await expect(locator.locator('strong[style*="color-green"]')).toHaveText(ok);
};

test.describe("immediate", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/pages/other+xss");
		await expect(
			field(page, "pagelist3").locator('strong[style*="color-green"]').first()
		).toBeVisible();
	});

	test("neither executes nor injects payloads", async ({ page }) => {
		await expectNoInjection(page);
	});

	test("escapes page titles in lists and pickers", async ({ page }) => {
		for (const name of ["pagelist1", "pagelist2", "pages1", "pages2"]) {
			await expect(field(page, name).locator(".k-item-title")).toHaveText(
				title
			);
		}
	});

	test("renders HTML from HTML queries in lists and pickers", async ({
		page
	}) => {
		for (const name of ["pagelist3", "pages3"]) {
			await expectRendered(field(page, name).locator(".k-item-title"));
			await expectRendered(field(page, name).locator(".k-item-info"));
		}
	});

	test("renders hardcoded HTML but escapes queries in options", async ({
		page
	}) => {
		const labels = field(page, "checkboxes1").locator(
			".k-choice-input-label-text"
		);

		await expectRendered(labels.nth(0));
		await expect(labels.nth(1)).toHaveText(title);
		await expectRendered(labels.nth(2));

		const toggles = field(page, "toggles1").locator(".k-toggles-text");

		await expectRendered(toggles.nth(0));
		await expect(toggles.nth(1)).toHaveText(title);
		await expectRendered(toggles.nth(2));
	});

	test("escapes options from APIs and queries", async ({ page }) => {
		await expect(
			field(page, "checkboxes2").locator(".k-choice-input-label-text").last()
		).toHaveText(option);
		await expect(field(page, "select2").locator("option").last()).toHaveText(
			option
		);

		for (const name of ["checkboxes4", "checkboxes5", "radio4", "radio5"]) {
			await expect(
				field(page, name).locator(".k-choice-input-label-text")
			).toHaveText([title]);
		}
	});

	test("renders HTML from HTML queries in options", async ({ page }) => {
		await expect(
			field(page, "checkboxes3").locator(".k-choice-input-label-text b")
		).toHaveText(["ppl", "soft", "K"]);

		await expectRendered(
			field(page, "checkboxes6").locator(".k-choice-input-label-text")
		);
	});

	test("sanitizes stored writer content", async ({ page }) => {
		const writer = field(page, "writer").locator(".ProseMirror");

		// the bold mark is allowed, its style and the image are not
		await expect(writer.locator("strong")).toHaveText(
			"Malicious string, hopefully sanitized"
		);
		await expect(writer.locator("strong")).not.toHaveAttribute("style");
		await expect(writer.locator("img")).toHaveCount(0);
	});

	test("escapes help texts from queries", async ({ page }) => {
		await expectRendered(field(page, "text1").locator(".k-field-help"));
		await expect(field(page, "text2").locator(".k-field-help")).toHaveText(
			title
		);
		await expectRendered(field(page, "text3").locator(".k-field-help"));

		const headlines = page.locator(".k-headline-field .k-field-help");
		await expectRendered(headlines.nth(0));
		await expect(headlines.nth(1)).toHaveText(title);
		await expectRendered(headlines.nth(2));
	});
});

test.describe("interaction", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/pages/other+xss");
		await tab(page, "Interaction");
	});

	test("escapes page titles in picker dialogs", async ({ page }) => {
		const dialog = page.locator(".k-dialog");

		for (const name of ["pages4", "pages5"]) {
			await field(page, name)
				.getByRole("button", { exact: true, name: "Select" })
				.click();
			await expect(dialog.locator(".k-item-title")).toHaveText([title]);
			await expectNoInjection(page);
			await dialog.getByRole("button", { name: "Cancel" }).click();
		}

		await field(page, "pages6")
			.getByRole("button", { exact: true, name: "Select" })
			.click();
		await expectRendered(dialog.locator(".k-item-title"));
		await expectRendered(dialog.locator(".k-item-info"));
	});

	for (const type of ["multiselect", "tags"]) {
		test.describe(type, () => {
			const open = async (page: Page, name: string) => {
				await field(page, name)
					.locator(`.k-${type}-input-toggle, .k-tags-input-toggle`)
					.first()
					.click();

				const dropdown = page.locator("dialog[open]").last();
				await expect(dropdown).toBeVisible();
				return dropdown;
			};

			test("strips hardcoded HTML from texts, but not infos", async ({
				page
			}) => {
				const dropdown = await open(page, `${type}7`);
				const texts = dropdown.locator(".k-choice-input-label-text");
				const infos = dropdown.locator(".k-choice-input-label-info");

				await expect(texts).toHaveText([ok, title, ok]);
				await expect(texts.locator("strong")).toHaveCount(0);
				await expectRendered(infos.nth(0));
				await expect(infos.nth(1)).toHaveText(title);
				await expectRendered(infos.nth(2));
				await expectNoInjection(page);
			});

			test("escapes options from APIs", async ({ page }) => {
				const dropdown = await open(page, `${type}8`);
				await expect(
					dropdown.locator(".k-choice-input-label-text").last()
				).toHaveText(option);
				await expectNoInjection(page);
			});

			test("strips HTML from API options", async ({ page }) => {
				const dropdown = await open(page, `${type}9`);
				const texts = dropdown.locator(".k-choice-input-label-text");

				await expect(texts).toHaveText(["Apple", "Microsoft", "Kirby"]);
				await expect(texts.locator("b")).toHaveCount(0);
			});

			test("escapes options from queries", async ({ page }) => {
				for (const name of [`${type}10`, `${type}11`]) {
					const dropdown = await open(page, name);
					await expect(
						dropdown.locator(".k-choice-input-label-text")
					).toHaveText([title]);
					await expectNoInjection(page);
					await page.keyboard.press("Escape");
					await page.keyboard.press("Escape");
				}
			});

			test("strips HTML from HTML queries", async ({ page }) => {
				const dropdown = await open(page, `${type}12`);
				const texts = dropdown.locator(".k-choice-input-label-text");

				await expect(texts).toHaveText([ok]);
				await expect(texts.locator("strong")).toHaveCount(0);
			});
		});
	}
});

test.describe("other views", () => {
	test("escapes page titles in the search dialog", async ({ page }) => {
		await page.goto("/panel/site");
		await page
			.getByRole("navigation", { name: "Menu" })
			.getByRole("button", { name: "Search" })
			.click();
		await page.keyboard.type("xss");

		await expect(
			page.getByRole("heading", { exact: true, level: 3, name: title })
		).toBeVisible();
		await expectNoInjection(page);
	});

	test("escapes page titles in the search view", async ({ page }) => {
		await page.goto("/panel/search?type=pages&query=xss");

		await expect(
			page.getByRole("heading", { exact: true, level: 3, name: title })
		).toBeVisible();
		await expectNoInjection(page);
	});

	test("escapes page titles in the changes dialog", async ({ page }) => {
		const model = "/api/pages/other+xss+xss-title/changes";
		const options = { headers: { "x-csrf": "dev" } };

		await page.request.post(`${model}/save?language=en`, {
			...options,
			data: { safestring: "changed" }
		});

		try {
			await page.goto("/panel/site");
			await page
				.getByRole("navigation", { name: "Menu" })
				.getByRole("button", { name: "Changes" })
				.click();

			await expect(
				page
					.locator(".k-dialog")
					.getByRole("heading", { exact: true, level: 3, name: title })
			).toBeVisible();
			await expectNoInjection(page);
		} finally {
			await page.request.post(`${model}/discard?language=en`, options);
		}
	});

	test("escapes the language name", async ({ page }) => {
		await page.goto("/panel/languages");

		await expect(
			page.getByRole("main").getByText("Malicious Deutsch</strong>")
		).toBeVisible();
		await expect(page.locator("main strong")).toHaveCount(0);
		await expect(page.locator("main img")).toHaveCount(0);
	});

	test.describe("users", () => {
		const name = `"><strong style="color: var(--color-red-700)">Malicious string</strong><img onerror="alert('XSS: Username')" src="x">`;
		const root = "public/site/accounts/xss";

		// the API strips HTML from names, so the account
		// is created directly in the file system
		test.beforeEach(() => {
			mkdirSync(root, { recursive: true });
			writeFileSync(
				`${root}/index.php`,
				`<?php\n\nreturn ${JSON.stringify({
					email: "xss@getkirby.com",
					language: "en",
					name,
					role: "editor"
				})
					.replace(/^\{/, "[")
					.replace(/\}$/, "]")
					.replaceAll('":', '" =>')};\n`
			);
		});

		test.afterEach(() => {
			rmSync(root, { force: true, recursive: true });
		});

		test("escapes the user name in the users view", async ({ page }) => {
			await page.goto("/panel/users");

			await expect(
				page.getByRole("heading", { exact: true, level: 3, name })
			).toBeVisible();
			await expectNoInjection(page);
		});

		test("escapes the user name in the search view", async ({ page }) => {
			await page.goto("/panel/search?type=users&query=xss");

			await expect(
				page.getByRole("heading", { exact: true, level: 3, name })
			).toBeVisible();
			await expectNoInjection(page);
		});

		test("strips HTML from names created via the API", async ({ page }) => {
			const response = await page.request.post("/api/users", {
				data: {
					email: "xss-api@getkirby.com",
					language: "en",
					name,
					password: "12345678",
					role: "editor"
				},
				headers: { "x-csrf": "dev" }
			});

			try {
				expect(response.ok()).toBe(true);
				const { data } = await response.json();
				expect(data.name).toBe(`">Malicious string`);
			} finally {
				await page.request.delete("/api/users/xss-api@getkirby.com", {
					headers: { "x-csrf": "dev" }
				});
			}
		});
	});
});
