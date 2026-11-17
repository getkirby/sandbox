import type { Page } from "@playwright/test";
import {
	dialog,
	discard,
	expect,
	field,
	heading,
	openChanges,
	restore,
	save,
	test
} from "./fixtures.ts";

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

type Changes = {
	store: (model: string, values: Record<string, unknown>) => Promise<void>;
};

/**
 * Stores unsaved changes for the model via the API
 * (they are discarded after the test by the `changes` fixture)
 */
const change = async (changes: Changes, model: Model) => {
	await changes.store(models[model].api, models[model].change);
};

const open = async (page: Page) => {
	await page.goto("/panel/site");
	return openChanges(page);
};

const section = (page: Page, headline: string) =>
	page
		.locator(".k-changes-dialog section")
		.filter({ has: page.getByRole("heading", { level: 2, name: headline }) });

test("shows an empty state without changes", async ({ page }) => {
	const changesDialog = await open(page);

	await expect(changesDialog.getByRole("heading", { level: 2 })).toHaveText(
		"Unsaved changes"
	);
	await expect(changesDialog).toContainText("There are no unsaved changes");
});

test("lists changed pages", async ({ changes, page }) => {
	await change(changes, "page");
	await open(page);

	const items = section(page, "Unsaved pages").locator(".k-item-title");
	await expect(items).toHaveText([models.page.title]);
	await expect(items.getByRole("link")).toHaveAttribute(
		"href",
		new RegExp(`${RegExp.escape(models.page.url)}$`)
	);
});

test("lists changed files", async ({ changes, page }) => {
	await change(changes, "file");
	await open(page);

	const items = section(page, "Unsaved files").locator(".k-item-title");
	await expect(items).toHaveText([models.file.title]);
	await expect(items.getByRole("link")).toHaveAttribute(
		"href",
		new RegExp(`${RegExp.escape(models.file.url)}$`)
	);
});

test("lists changed users", async ({ changes, page }) => {
	await change(changes, "user");
	await open(page);

	const items = section(page, "Unsaved accounts").locator(".k-item");
	await expect(items.locator(".k-item-title")).toHaveText([models.user.title]);
	await expect(items.locator(".k-item-info")).toHaveText(["Editor"]);
});

test("lists the changed site", async ({ changes, page }) => {
	await change(changes, "site");
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

test("groups all changed models", async ({ changes, page }) => {
	for (const model of Object.keys(models) as Model[]) {
		await change(changes, model);
	}

	const changesDialog = await open(page);

	await expect(changesDialog.getByRole("heading", { level: 2 })).toHaveText([
		"Unsaved pages",
		"Unsaved files",
		"Unsaved accounts"
	]);
	await expect(changesDialog.locator(".k-item")).toHaveCount(3);
});

test("opens changed models from the dialog", async ({ changes, page }) => {
	await change(changes, "page");
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

test("removes discarded changes from the dialog", async ({ changes, page }) => {
	await change(changes, "page");
	await change(changes, "user");

	await page.goto("/panel/pages/fields+text");
	await discard(page).click();
	await dialog(page).getByRole("button", { name: "Discard" }).click();

	// wait until the discard is done before leaving the view
	await expect(discard(page)).toBeHidden();

	const changesDialog = await open(page);
	await expect(changesDialog.getByRole("heading", { level: 2 })).toHaveText([
		"Unsaved accounts"
	]);
});

test("removes saved changes from the dialog", async ({ changes, page }) => {
	await change(changes, "file");

	await page.goto(models.file.url);
	await save(page).click();
	await expect(save(page)).toBeHidden();

	const changesDialog = await open(page);
	await expect(changesDialog).toContainText("There are no unsaved changes");

	// restore the original content of the file
	restore("content/fields/filelist/kirby.pdf.en.txt");
});
