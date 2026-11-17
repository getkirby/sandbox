import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const editor = (page: Page, name: string) =>
	field(page, name).locator(".ProseMirror");

const toolbar = (page: Page, name: string) =>
	field(page, name).locator(".k-writer-toolbar");

const write = async (page: Page, name: string, ...items: string[]) => {
	await editor(page, name).click();

	for (const [index, item] of items.entries()) {
		if (index > 0) {
			await page.keyboard.press("Enter");
		}

		await page.keyboard.type(item);
	}
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+list");
});

test("renders the list fields", async ({ page }) => {
	await expect(heading(page, "List", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-list").first()).toBeVisible();
});

test("stores list items as HTML", async ({ changes, page }) => {
	await write(page, "list", "One", "Two");

	await expect(editor(page, "list").locator("li")).toHaveText(["One", "Two"]);
	await expect(field(page, "list").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).list).toBe(
		"<ul><li>One</li><li>Two</li></ul>"
	);
});

test("formats list items", async ({ changes, page }) => {
	await write(page, "list", "Kirby");
	await page.keyboard.press("ControlOrMeta+a");
	await toolbar(page, "list").getByRole("button", { name: "Bold" }).click();

	expect((await changes.saved()).list).toBe(
		"<ul><li><strong>Kirby</strong></li></ul>"
	);
});

test("converts to an ordered list", async ({ changes, page }) => {
	await write(page, "list", "One", "Two");
	await page.keyboard.press("ControlOrMeta+a");
	await toolbar(page, "list").getByRole("button").first().click();
	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Ordered list" })
		.click();

	expect((await changes.saved()).list).toBe(
		"<ol><li>One</li><li>Two</li></ol>"
	);
});

test("disables the field", async ({ page }) => {
	await expect(editor(page, "disabled")).toHaveAttribute(
		"contenteditable",
		"false"
	);
	await expect(editor(page, "disabledWithValue").locator("li")).toHaveText([
		"This is a value",
		"And another one"
	]);
	await expect(editor(page, "disabledWithValue")).toHaveAttribute(
		"contenteditable",
		"false"
	);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	const invalid = field(page, "required").locator(".k-label-invalid");

	await expect(invalid).toBeVisible();
	await write(page, "required", "One");
	await expect(invalid).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
