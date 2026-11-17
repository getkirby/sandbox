import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const drawer = (page: Page) => page.locator(".k-drawer");

/**
 * Opens the drawer of an empty object field,
 * fills its first text input and closes it again
 */
const add = async (page: Page, name: string, text?: string) => {
	await field(page, name).locator(".k-empty").click();
	await expect(drawer(page)).toBeVisible();

	if (text !== undefined) {
		await drawer(page).getByRole("textbox").first().fill(text);
	}

	await page.keyboard.press("Escape");
	await expect(drawer(page)).toBeHidden();
};

const cells = (page: Page, name: string) => field(page, name).locator("td");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+object");
});

test("renders the object fields", async ({ page }) => {
	await expect(heading(page, "Object", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-object").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(field(page, "simple").locator(".k-empty")).toHaveText(
		"No information yet"
	);
	await expect(field(page, "empty").locator(".k-empty")).toHaveText(
		"Custom empty text"
	);
});

test("adds a value", async ({ changes, page }) => {
	await add(page, "simple", "Hello");

	await expect(field(page, "simple").locator("th")).toHaveText(["Text"]);
	await expect(cells(page, "simple")).toHaveText(["Hello"]);
	await expect(field(page, "simple").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).simple).toEqual({ text: "Hello" });
});

test("edits the value", async ({ changes, page }) => {
	await add(page, "simple", "Hello");

	await cells(page, "simple").first().click();
	await drawer(page).getByRole("textbox").first().fill("Edited");
	await page.keyboard.press("Escape");

	await expect(cells(page, "simple")).toHaveText(["Edited"]);
	expect((await changes.saved()).simple).toEqual({ text: "Edited" });
});

test("removes the value", async ({ page }) => {
	await add(page, "simple", "Hello");

	await field(page, "simple").locator("header").getByRole("button").click();

	await expect(field(page, "simple").locator(".k-empty")).toHaveText(
		"No information yet"
	);
});

test("shows all fields in the drawer", async ({ page }) => {
	await field(page, "multipleFields").locator(".k-empty").click();

	for (const name of ["email", "url", "tel"]) {
		await expect(drawer(page).locator(`.k-field-name-${name}`)).toBeVisible();
	}

	await expect(drawer(page).locator(".k-field-name-text")).toHaveCount(0);
});

test("disables the field", async ({ page }) => {
	await expect(cells(page, "disabledWithValue")).toHaveText([
		"This is a value"
	]);
	await expect(field(page, "disabled")).toContainText("No information yet");
	await expect(field(page, "disabled").getByRole("button")).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Custom help text"
	);
});

test("prefills default values", async ({ page }) => {
	await tab(page, "Defaults");
	await add(page, "fieldWithDefaultValue");
	await add(page, "disabledFieldWithDefaultValue");

	await expect(cells(page, "fieldWithDefaultValue")).toHaveText([
		"Some default text"
	]);
	await expect(cells(page, "disabledFieldWithDefaultValue")).toHaveText([
		"Some default text"
	]);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	const invalid = field(page, "required").locator(".k-label-invalid");

	await expect(invalid).toBeVisible();
	await add(page, "required", "Hello");
	await expect(invalid).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
