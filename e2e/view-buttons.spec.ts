import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, heading, isolatedSession, test } from "./fixtures.ts";

const url = "/panel/pages/other+view-buttons";

const uuid = readFileSync(
	"environments/lab/content/other/view-buttons/view-buttons.en.txt",
	"utf8"
).match(/Uuid: (\w+)/)![1];

const buttons = (page: Page) => page.locator(".k-view-buttons");

const button = (page: Page, name: string) =>
	buttons(page).getByRole("button", { exact: true, name });

const link = (page: Page, name: string) =>
	buttons(page).getByRole("link", { exact: true, name });

test.describe("configured buttons", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url);
		await expect(heading(page, "View buttons", 1)).toBeVisible();
	});

	test("shows the configured buttons in order", async ({ page }) => {
		await expect(buttons(page)).toMatchAriaSnapshot(`
			- navigation:
			  - link "Preview"
			  - link "Stats"
			  - button "Praise"
			  - button "Settings"
		`);
	});

	test("replaces the default buttons", async ({ page }) => {
		// no open link, language dropdown or status button
		await expect(link(page, "Open")).toHaveCount(0);
		await expect(button(page, "EN")).toHaveCount(0);
		await expect(
			buttons(page).getByRole("button", { name: /^Status/ })
		).toHaveCount(0);

		// pages without configured buttons show the defaults
		await page.goto("/panel/pages/fields+text");
		await expect(link(page, "Open")).toBeVisible();
		await expect(link(page, "Preview")).toBeVisible();
		await expect(button(page, "Settings")).toBeVisible();
		await expect(button(page, "EN")).toBeVisible();
		await expect(
			buttons(page).getByRole("button", { name: "Unlisted" })
		).toBeVisible();
	});

	test("links to the preview", async ({ page }) => {
		await expect(link(page, "Preview")).toHaveAttribute(
			"href",
			new RegExp(`${RegExp.escape(url)}/preview/form$`)
		);
	});

	test("renders custom link buttons", async ({ page }) => {
		const stats = link(page, "Stats");

		// the link query is resolved with the page UUID
		await expect(stats).toHaveAttribute(
			"href",
			`https://my-analytics.com/page/${uuid}`
		);
		await expect(stats).toHaveAttribute("target", "_blank");
		await expect(stats).toHaveAttribute("rel", "noreferrer noopener");
		await expect(stats).toHaveAttribute("data-theme", "aqua");
		await expect(stats.locator(".k-icon")).toHaveAttribute(
			"data-type",
			"chart"
		);
		await expect(stats).toHaveText("Stats");
	});

	test("opens the settings dropdown", async ({ page }) => {
		await button(page, "Settings").click();

		const dropdown = page.locator("dialog[open]").last();
		await expect(
			dropdown.getByRole("button", { name: "Rename" })
		).toBeVisible();
		await expect(
			dropdown.getByRole("button", { name: "Delete" })
		).toBeVisible();
	});

	test.describe("plugin buttons", () => {
		// the applause button shows a native alert by design
		test.use({ ignoreErrors: [/Unexpected dialog: 👏 Awesome job!/] });

		test("renders buttons registered by plugins", async ({ page }) => {
			const applause = button(page, "Praise");

			await expect(applause).toHaveAttribute("data-theme", "purple");
			await expect(applause.locator(".k-icon")).toHaveAttribute(
				"data-type",
				"heart"
			);

			const alert = page.waitForEvent("dialog");
			await applause.click();
			expect((await alert).message()).toBe("👏 Awesome job!");
		});
	});
});

test.describe("translated texts", () => {
	const account = "public/site/accounts/editor";

	// switch the interface language of the editor to German
	test.beforeEach(() => {
		const file = `${account}/index.php`;
		writeFileSync(
			file,
			readFileSync(file, "utf8").replace(
				"'language' => 'en'",
				"'language' => 'de'"
			)
		);
	});

	isolatedSession("editor@getkirby.com");

	test.afterEach(() => {
		rmSync(account, { force: true, recursive: true });
		cpSync("environments/lab/site/accounts/editor", account, {
			recursive: true
		});
	});

	test("uses the interface language for button texts", async ({ page }) => {
		await page.goto(url);
		await expect(link(page, "KPIs")).toBeVisible();
		await expect(link(page, "Stats")).toHaveCount(0);
	});
});

test.describe("site", () => {
	test("shows the buttons configured in the config", async ({ page }) => {
		await page.goto("/panel/site");

		await expect(buttons(page)).toMatchAriaSnapshot(`
			- navigation:
			  - link "Preview"
			  - link "Reference"
			  - button "EN"
		`);

		const reference = link(page, "Reference");
		await expect(reference).toHaveAttribute(
			"href",
			"https://getkirby.com/docs/reference"
		);
		await expect(reference).toHaveAttribute("target", "_blank");
		await expect(reference.locator(".k-icon")).toHaveAttribute(
			"data-type",
			"book"
		);
	});
});
