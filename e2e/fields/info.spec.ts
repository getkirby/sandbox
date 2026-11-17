import type { Page } from "@playwright/test";
import { expect, heading, tab, test } from "../fixtures.ts";

/**
 * Info fields have no name class,
 * so they are found by their label
 */
const info = (page: Page, label: string) =>
	page
		.locator(".k-info-field")
		.filter({ has: page.getByRole("heading", { exact: true, name: label }) });

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+info");
});

test("renders the info fields", async ({ page }) => {
	await expect(heading(page, "Info", 1)).toBeVisible();
	await expect(page.locator(".k-info-field").first()).toBeVisible();
});

test("shows the text in a box", async ({ page }) => {
	await expect(info(page, "Default").locator(".k-box")).toHaveText(
		"This is some test text"
	);
	await expect(info(page, "Default").locator(".k-box")).toHaveAttribute(
		"data-theme",
		"info"
	);
});

test("applies the themes", async ({ page }) => {
	for (const theme of [
		"white",
		"passive",
		"empty",
		"dark",
		"warning",
		"notice",
		"negative",
		"positive",
		"none",
		"text"
	]) {
		const label = theme.charAt(0).toUpperCase() + theme.slice(1);
		await expect(info(page, label).locator(".k-box")).toHaveAttribute(
			"data-theme",
			theme
		);
	}
});

test("hides empty labels", async ({ page }) => {
	const fields = page.locator(".k-info-field");

	await expect(fields.last().locator(".k-box")).toBeVisible();
	await expect(fields.last().getByRole("heading")).toHaveCount(0);
});

test("shows icons", async ({ page }) => {
	await tab(page, "Icons");

	await expect(
		info(page, "Info icon").locator('.k-box .k-icon[data-type="info"]')
	).toBeVisible();
	await expect(
		info(page, "Heart icon").locator('.k-box .k-icon[data-type="heart"]')
	).toBeVisible();
	await expect(info(page, "Heart icon").locator(".k-box")).toHaveAttribute(
		"data-theme",
		"positive"
	);
});

test("arranges info boxes in columns", async ({ page }) => {
	await tab(page, "Columns");
	await expect(info(page, "Column one half 1")).toBeVisible();

	const boxes = page.locator(".k-info-field");
	const first = await boxes.nth(0).boundingBox();
	const second = await boxes.nth(1).boundingBox();

	// two halves next to each other
	expect(second!.x).toBeGreaterThan(first!.x);
	expect(second!.y).toBeCloseTo(first!.y, 0);
	expect(second!.width).toBeCloseTo(first!.width, 0);
});

test("does not leak field props as HTML attributes", async ({ page }) => {
	// Known bug: the component lacks `inheritAttrs: false`, so props like
	// `endpoints` end up as attributes, e.g. `endpoints="[object Object]"`.
	// Remove this line once fixed.
	test.fail();

	const element = page.locator(".k-info-field").first();
	await expect(element).toBeAttached();
	await expect(element).not.toHaveAttribute("endpoints", { timeout: 1000 });
});
