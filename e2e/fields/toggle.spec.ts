import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const toggle = (page: Page, name: string) =>
	field(page, name).locator("input.k-toggle-input");

const text = (page: Page, name: string) =>
	field(page, name).locator(".k-choice-input-label-text");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+toggle");
});

test("renders the toggle fields", async ({ page }) => {
	await expect(heading(page, "Toggle", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-toggle").first()).toBeVisible();
});

test("switches the toggle on and off", async ({ page }) => {
	const label = field(page, "toggle").locator(".k-label");

	await expect(toggle(page, "toggle")).not.toBeChecked();
	await expect(text(page, "toggle")).toHaveText("off");

	await text(page, "toggle").click();
	await expect(toggle(page, "toggle")).toBeChecked();
	await expect(text(page, "toggle")).toHaveText("on");
	await expect(label).toHaveAttribute("data-has-diff", "true");

	await text(page, "toggle").click();
	await expect(toggle(page, "toggle")).not.toBeChecked();
	await expect(text(page, "toggle")).toHaveText("off");
});

test("disables the toggle", async ({ page }) => {
	await expect(toggle(page, "disabled")).toBeDisabled();
	await expect(toggle(page, "disabledWithValue")).toBeDisabled();
	await expect(toggle(page, "disabledWithValue")).toBeChecked();
	await expect(text(page, "disabledWithValue")).toHaveText("on");
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("shows custom texts", async ({ page }) => {
	await tab(page, "Text");

	for (const name of ["text", "textTranslated"]) {
		await expect(text(page, name)).toHaveText("Nope");
		await text(page, name).click();
		await expect(text(page, name)).toHaveText("Yay");
	}
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	const invalid = field(page, "required").locator(".k-label-invalid");

	await expect(invalid).toBeVisible();
	await text(page, "required").click();
	await expect(invalid).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
