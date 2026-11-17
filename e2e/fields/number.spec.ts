import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

const input = (page: Page, name: string) =>
	field(page, name).locator("input.k-number-input");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+number");
});

test("renders the number fields", async ({ page }) => {
	await expect(heading(page, "Number", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-number").first()).toBeVisible();
});

test("accepts numbers only", async ({ page }) => {
	const label = field(page, "number").locator(".k-label");

	await input(page, "number").pressSequentially("abc");
	await expect(input(page, "number")).toHaveValue("");

	await input(page, "number").fill("42");
	await expect(input(page, "number")).toHaveValue("42");
	await expect(label).toHaveAttribute("data-has-diff", "true");
});

test("shows placeholder, icons, before and after texts", async ({ page }) => {
	await expect(input(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Some number …"
	);
	// number inputs have no default icon
	await expect(field(page, "number").locator(".k-input-icon")).toHaveCount(0);
	await expect(
		field(page, "icon").locator('.k-input-icon [data-type="text"]')
	).toBeVisible();

	const all = field(page, "beforeAndAfterAndIcon");
	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("steps through values", async ({ page }) => {
	await expect(input(page, "step")).toHaveAttribute("step", "0.05");
	await expect(input(page, "stepAny")).toHaveAttribute("step", "any");

	await input(page, "step").fill("1");
	await input(page, "step").press("ArrowUp");
	await expect(input(page, "step")).toHaveValue("1.05");
});

test("disables the input", async ({ page }) => {
	await expect(input(page, "disabled")).toBeDisabled();
	await expect(input(page, "disabledWithValue")).toBeDisabled();
	await expect(input(page, "disabledWithValue")).toHaveValue("1");
	await expect(input(page, "disabledWithPlaceholder")).toHaveAttribute(
		"placeholder",
		"Disabled with placeholder"
	);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await input(page, "required").fill("1");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum", async ({ page }) => {
		await input(page, "min").fill("5");
		await expect(invalid(page, "min")).toBeVisible();
		await input(page, "min").fill("10");
		await expect(invalid(page, "min")).toBeHidden();
	});

	test("validates the maximum", async ({ page }) => {
		await input(page, "max").fill("15");
		await expect(invalid(page, "max")).toBeVisible();
		await input(page, "max").fill("10");
		await expect(invalid(page, "max")).toBeHidden();
	});

	test("validates the range", async ({ page }) => {
		for (const [value, valid] of [
			["4", false],
			["5", true],
			["10", true],
			["11", false]
		] as const) {
			await input(page, "minmax").fill(value);

			if (valid === true) {
				await expect(invalid(page, "minmax")).toBeHidden();
			} else {
				await expect(invalid(page, "minmax")).toBeVisible();
			}
		}
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
