import { copyFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, field, heading, test } from "./fixtures.ts";

const headers = { "x-csrf": "dev" };

/**
 * Models used in the tests with a change for one of their fields
 */
const models = {
	file: {
		api: "pages/fields+filelist/files/kirby.pdf",
		change: { alt: "Changed" },
		title: "kirby.pdf",
		url: "/panel/pages/fields+filelist/files/kirby.pdf"
	},
	page: {
		api: "pages/fields+text",
		change: { text: "Changed" },
		title: "Text",
		url: "/panel/pages/fields+text"
	},
	site: {
		api: "site",
		change: { text: "Changed" },
		title: "Lab",
		url: "/panel/site"
	},
	user: {
		api: "users/editor",
		change: { bio: "Changed" },
		title: "editor",
		url: "/panel/users/editor"
	}
};

type Model = keyof typeof models;

/**
 * Stores unsaved changes for the model via the API
 */
const change = async (page: Page, model: Model) => {
	const { api, change } = models[model];
	const response = await page.request.post(
		`/api/${api}/changes/save?language=en`,
		{ data: change, headers }
	);

	expect(response.ok()).toBe(true);
};

const open = async (page: Page) => {
	await page.goto("/panel/site");
	await page
		.getByRole("navigation", { name: "Menu" })
		.getByRole("button", { name: "Changes" })
		.click();

	const dialog = page.locator(".k-changes-dialog");
	await expect(dialog).toBeVisible();
	return dialog;
};

const section = (page: Page, headline: string) =>
	page
		.locator(".k-changes-dialog section")
		.filter({ has: page.getByRole("heading", { level: 2, name: headline }) });

/**
 * Discards all changes created via the API, as the
 * `changes` fixture only tracks changes made in the Panel
 */
test.afterEach(async ({ page }) => {
	for (const { api } of Object.values(models)) {
		await page.request.post(`/api/${api}/changes/discard?language=en`, {
			headers
		});
	}
});

test("shows an empty state without changes", async ({ page }) => {
	const dialog = await open(page);

	await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
		"Unsaved changes"
	);
	await expect(dialog).toContainText("There are no unsaved changes");
});

test("lists changed pages", async ({ page }) => {
	await change(page, "page");
	await open(page);

	const items = section(page, "Unsaved pages").locator(".k-item-title");
	await expect(items).toHaveText([models.page.title]);
	await expect(items.getByRole("link")).toHaveAttribute(
		"href",
		new RegExp(`${RegExp.escape(models.page.url)}$`)
	);
});

test("lists changed files", async ({ page }) => {
	await change(page, "file");
	await open(page);

	const items = section(page, "Unsaved files").locator(".k-item-title");
	await expect(items).toHaveText([models.file.title]);
	await expect(items.getByRole("link")).toHaveAttribute(
		"href",
		new RegExp(`${RegExp.escape(models.file.url)}$`)
	);
});

test("lists changed users", async ({ page }) => {
	await change(page, "user");
	await open(page);

	const items = section(page, "Unsaved accounts").locator(".k-item");
	await expect(items.locator(".k-item-title")).toHaveText([models.user.title]);
	await expect(items.locator(".k-item-info")).toHaveText(["Editor"]);
});

test("lists the changed site", async ({ page }) => {
	await change(page, "site");
	await open(page);

	// Known bug: the changes dialog only lists pages, files and
	// users, so unsaved changes of the site never show up.
	// Remove this line once fixed.
	test.fail();

	await expect(page.locator(".k-changes-dialog")).toContainText(
		models.site.title,
		{ timeout: 1000 }
	);
});

test("groups all changed models", async ({ page }) => {
	for (const model of Object.keys(models) as Model[]) {
		await change(page, model);
	}

	const dialog = await open(page);

	await expect(dialog.getByRole("heading", { level: 2 })).toHaveText([
		"Unsaved pages",
		"Unsaved files",
		"Unsaved accounts"
	]);
	await expect(dialog.locator(".k-item")).toHaveCount(3);
});

test("opens changed models from the dialog", async ({ page }) => {
	await change(page, "page");
	await open(page);

	await section(page, "Unsaved pages")
		.getByRole("link", { name: "Text" })
		.click();

	await expect(page).toHaveURL(/\/panel\/pages\/fields\+text$/);
	await expect(heading(page, "Text", 1)).toBeVisible();
	await expect(page.locator(".k-changes-dialog")).toBeHidden();
	await expect(field(page, "text").getByRole("textbox").first()).toHaveValue(
		"Changed"
	);
});

test("lists changes made in the Panel", async ({ changes, page }) => {
	await page.goto("/panel/pages/fields+text");
	await field(page, "placeholder").getByRole("textbox").fill("Edited");
	await changes.settled();

	await open(page);
	await expect(
		section(page, "Unsaved pages").locator(".k-item-title")
	).toHaveText(["Text"]);
});

test("removes discarded changes from the dialog", async ({ page }) => {
	await change(page, "page");
	await change(page, "user");

	await page.goto("/panel/pages/fields+text");
	await page.getByRole("button", { exact: true, name: "Discard" }).click();
	await page
		.locator(".k-dialog")
		.getByRole("button", { name: "Discard" })
		.click();

	// wait until the discard is done before leaving the view
	await expect(
		page.getByRole("button", { exact: true, name: "Discard" })
	).toBeHidden();

	const dialog = await open(page);
	await expect(dialog.getByRole("heading", { level: 2 })).toHaveText([
		"Unsaved accounts"
	]);
});

test("removes saved changes from the dialog", async ({ page }) => {
	await change(page, "file");

	await page.goto(models.file.url);
	await page.getByRole("button", { exact: true, name: "Save" }).click();
	await expect(
		page.getByRole("button", { exact: true, name: "Save" })
	).toBeHidden();

	const dialog = await open(page);
	await expect(dialog).toContainText("There are no unsaved changes");

	// restore the original content of the file
	copyFileSync(
		"environments/lab/content/fields/filelist/kirby.pdf.en.txt",
		"public/content/fields/filelist/kirby.pdf.en.txt"
	);
});
