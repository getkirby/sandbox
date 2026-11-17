import type { Page } from "@playwright/test";
import {
	choice,
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const toggle = (page: Page, name: string, label: string) =>
	field(page, name).locator(`label[title="${label}"]`);

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+toggles");
});

test("renders the toggles fields", async ({ page }) => {
	await expect(heading(page, "Toggles", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-toggles").first()).toBeVisible();
});

test("selects a single option", async ({ changes, page }) => {
	await toggle(page, "labels", "Center").click();
	await expect(choice(page, "labels", "center")).toBeChecked();

	await toggle(page, "labels", "Right").click();
	await expect(choice(page, "labels", "right")).toBeChecked();
	await expect(choice(page, "labels", "center")).not.toBeChecked();

	await expect(field(page, "labels").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).labels).toBe("right");
});

test("selects options with the arrow keys", async ({ page }) => {
	await toggle(page, "labels", "Left").click();
	await page.keyboard.press("ArrowRight");

	await expect(choice(page, "labels", "center")).toBeChecked();
});

test("shows labels and icons", async ({ page }) => {
	const labels = field(page, "labels");
	await expect(labels.locator(".k-toggles-text")).toHaveText([
		"Left",
		"Center",
		"Right",
		"Justify"
	]);
	await expect(labels.locator(".k-icon")).toHaveCount(0);

	const both = field(page, "iconsAndLabels");
	await expect(both.locator(".k-toggles-text")).toHaveCount(4);
	await expect(both.locator(".k-icon")).toHaveCount(4);

	const icons = field(page, "icons");
	await expect(icons.locator(".k-icon")).toHaveCount(4);
	await expect(icons.locator(".k-toggles-text")).toHaveCount(0);

	// icon-only options are still labelled
	await expect(choice(page, "icons", "justify")).toHaveAccessibleName(
		"Justify"
	);
});

test("disables the options", async ({ page }) => {
	for (const value of ["left", "center", "right", "justify"]) {
		await expect(choice(page, "disabled", value)).toBeDisabled();
	}

	await expect(choice(page, "disabledWithValue", "center")).toBeChecked();
	await expect(choice(page, "disabledWithValue", "center")).toBeDisabled();
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is some nice help here"
	);
});

test("only grows when configured", async ({ page }) => {
	const growing = await field(page, "labels")
		.locator(".k-toggles-input")
		.boundingBox();

	await tab(page, "Autosize");

	const input = field(page, "nonGrowingLabels").locator(".k-toggles-input");
	await expect(input).not.toHaveClass(/grow/);

	const fixed = await input.boundingBox();
	expect(fixed!.width).toBeLessThan(growing!.width);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	const invalid = field(page, "required").locator(".k-label-invalid");

	await expect(invalid).toBeVisible();
	await toggle(page, "required", "Left").click();
	await expect(invalid).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
