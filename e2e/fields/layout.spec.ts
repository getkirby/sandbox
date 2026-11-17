import type { Page } from "@playwright/test";
import {
	dialog,
	drawer,
	dropdown,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

/**
 * Adds a new row with the given layout
 */
const add = async (page: Page, name: string, layout: string) => {
	await field(page, name)
		.locator("header")
		.getByRole("button", { name: "Add" })
		.click();
	await dialog(page).getByRole("button", { exact: true, name: layout }).click();
	await expect(dialog(page)).toBeHidden();
};

const columns = (page: Page, name: string, row = 0) =>
	rows(page, name).nth(row).locator(".k-layout-column");

const menu = async (page: Page, name: string, row = 0) => {
	await rows(page, name)
		.nth(row)
		.locator(".k-layout-toolbar-button")
		.last()
		.click();

	return dropdown(page);
};

const rows = (page: Page, name: string) =>
	field(page, name).locator(".k-layout");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+layout");
});

test("renders the layout fields", async ({ page }) => {
	await expect(heading(page, "Layout", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-layout").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(field(page, "layouts").locator(".k-empty")).toHaveText(
		"No rows yet"
	);
	await expect(field(page, "empty").locator(".k-empty")).toHaveText(
		"This is some custom empty text"
	);
});

test("lists the configured layouts", async ({ page }) => {
	await field(page, "layouts")
		.locator("header")
		.getByRole("button", { name: "Add" })
		.click();

	await expect(dialog(page)).toMatchAriaSnapshot(`
		- heading "Select a layout" [level=3]
		- button "1/1"
		- button "1/2,1/2"
		- button "1/4,1/4,1/4,1/4"
		- button "1/1,1/3,2/3"
		- button "1/1,2/3,1/3"
		- button "1/2,1/2,1/3,1/3,1/3"
	`);
});

test("adds rows with the selected layout", async ({ changes, page }) => {
	await add(page, "layouts", "1/4,1/4,1/4,1/4");

	await expect(columns(page, "layouts")).toHaveCount(4);
	await expect(field(page, "layouts").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);

	const [row] = (await changes.saved()).layouts as {
		columns: { width: string }[];
	}[];

	expect(row.columns.map((column) => column.width)).toEqual([
		"1/4",
		"1/4",
		"1/4",
		"1/4"
	]);
});

test("adds blocks to columns", async ({ changes, page }) => {
	await add(page, "layouts", "1/2,1/2");

	await columns(page, "layouts").nth(1).locator(".k-blocks-empty").click();
	await dialog(page)
		.getByRole("button", { exact: true, name: "Heading" })
		.click();

	await expect(
		columns(page, "layouts").nth(1).locator(".ProseMirror")
	).toBeFocused();
	await page.keyboard.type("Hello");

	const [row] = (await changes.saved()).layouts as {
		columns: { blocks: { content: { text: string }; type: string }[] }[];
	}[];

	expect(row.columns[0].blocks).toEqual([]);
	expect(row.columns[1].blocks[0].type).toBe("heading");
	expect(row.columns[1].blocks[0].content.text).toBe("Hello");
});

test("shows the row options", async ({ page }) => {
	await add(page, "layouts", "1/1");

	await expect(await menu(page, "layouts")).toMatchAriaSnapshot(`
		- dialog:
		  - button "Insert before"
		  - button "Insert after"
		  - separator
		  - button "Duplicate"
		  - button "Change layout"
		  - separator
		  - button "Copy"
		  - button "Paste after"
		  - separator
		  - button "Delete layout"
	`);
});

test("duplicates rows", async ({ page }) => {
	await add(page, "layouts", "1/2,1/2");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Duplicate" })
		.click();

	await expect(rows(page, "layouts")).toHaveCount(2);
	await expect(columns(page, "layouts", 1)).toHaveCount(2);
});

test("changes the layout of rows", async ({ page }) => {
	await add(page, "layouts", "1/2,1/2");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Change layout" })
		.click();
	await dialog(page).getByRole("button", { exact: true, name: "1/1" }).click();

	await expect(columns(page, "layouts")).toHaveCount(1);
});

test("deletes rows", async ({ page }) => {
	await add(page, "layouts", "1/1");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Delete layout" })
		.click();
	await dialog(page).getByRole("button", { name: "Delete" }).click();

	await expect(rows(page, "layouts")).toHaveCount(0);
	await expect(field(page, "layouts").locator(".k-empty")).toBeVisible();
});

test("edits row settings", async ({ changes, page }) => {
	await add(page, "settings", "1/1");

	await rows(page, "settings")
		.first()
		.getByRole("button", { name: "Settings" })
		.click();

	await drawer(page)
		.locator(".k-field-name-class")
		.getByRole("textbox")
		.fill("hero");
	await drawer(page)
		.locator(".k-field-name-id")
		.getByRole("textbox")
		.fill("intro");
	await page.keyboard.press("Escape");

	const [row] = (await changes.saved()).settings as {
		attrs: Record<string, string>;
	}[];

	expect(row.attrs).toEqual({ class: "hero", id: "intro" });
});

test("disables the field", async ({ page }) => {
	await expect(field(page, "disabledWithValue")).toContainText(
		"This is a value"
	);
	await expect(field(page, "disabledWithValue")).toContainText(
		"With some text"
	);
	await expect(columns(page, "disabledWithValue")).toHaveCount(2);
	await expect(rows(page, "disabledWithValue")).toHaveAttribute(
		"data-disabled",
		"true"
	);
	await expect(
		field(page, "disabled").getByRole("button", { name: "Add" })
	).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is some help text"
	);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await add(page, "required", "1/1");
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
