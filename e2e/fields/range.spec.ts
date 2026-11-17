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

const slider = (page: Page, name: string) =>
	field(page, name).getByRole("slider");

const tooltip = (page: Page, name: string) =>
	field(page, name).locator(".k-range-input-tooltip");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+range");
});

test("renders the range fields", async ({ page }) => {
	await expect(heading(page, "Range", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-range").first()).toBeVisible();
});

test("uses the default range", async ({ page }) => {
	await expect(slider(page, "range")).toHaveAttribute("min", "0");
	await expect(slider(page, "range")).toHaveAttribute("max", "100");
	await expect(slider(page, "range")).toHaveAttribute("step", "1");

	// empty values are shown as dash
	await expect(tooltip(page, "range")).toHaveText("–");
});

test("stores the selected value", async ({ changes, page }) => {
	await slider(page, "range").fill("42");

	await expect(tooltip(page, "range")).toHaveText("42");
	await expect(field(page, "range").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).range).toBe(42);
});

test("steps with the arrow keys", async ({ page }) => {
	await slider(page, "range").fill("42");
	await slider(page, "range").press("ArrowRight");

	await expect(tooltip(page, "range")).toHaveText("43");
});

test("uses decimal steps", async ({ changes, page }) => {
	await expect(slider(page, "step")).toHaveAttribute("step", "0.1");

	await slider(page, "step").fill("4.2");
	await expect(tooltip(page, "step")).toHaveText("4.2");
	expect((await changes.saved()).step).toBe(4.2);
});

test("shows icons, before and after texts", async ({ page }) => {
	const all = field(page, "beforeAndAfterAndIcon");

	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("disables the slider", async ({ page }) => {
	await expect(slider(page, "disabled")).toBeDisabled();
	await expect(slider(page, "disabledWithValue")).toBeDisabled();
	await expect(slider(page, "disabledWithValue")).toHaveValue("10");
	await expect(tooltip(page, "disabledWithValue")).toHaveText("10");
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test.describe("tooltip", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Tooltip");
	});

	test("hides the tooltip", async ({ page }) => {
		await expect(slider(page, "tooltipDisabled")).toBeVisible();
		await expect(tooltip(page, "tooltipDisabled")).toHaveCount(0);
	});

	test("shows texts before and after the value", async ({ page }) => {
		await slider(page, "tooltipBeforeAndAfter").fill("42");
		await expect(tooltip(page, "tooltipBeforeAndAfter")).toHaveText(
			"Before42After"
		);

		await expect(
			tooltip(page, "tooltipBefore").locator(".k-range-input-tooltip-after")
		).toHaveCount(0);
		await expect(
			tooltip(page, "tooltipAfter").locator(".k-range-input-tooltip-before")
		).toHaveCount(0);
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		// Known bug: the initial validation runs before the input is
		// mounted, so empty required ranges are never marked as invalid.
		// Remove this line once fixed.
		test.fail();

		await expect(invalid(page, "required")).toBeVisible({ timeout: 1000 });
		await slider(page, "required").fill("5");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("limits the range to min and max", async ({ page }) => {
		await expect(slider(page, "min")).toHaveAttribute("min", "10");
		await expect(slider(page, "max")).toHaveAttribute("max", "10");
		await expect(slider(page, "minmax")).toHaveAttribute("min", "5");
		await expect(slider(page, "minmax")).toHaveAttribute("max", "10");

		await slider(page, "minmax").fill("10");
		await slider(page, "minmax").press("ArrowRight");
		await expect(tooltip(page, "minmax")).toHaveText("10");
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
