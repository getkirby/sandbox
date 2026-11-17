import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const reports = (page: Page, name: string) =>
	field(page, name).locator(".k-stat");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+stats");
});

test("renders the stats fields", async ({ page }) => {
	await expect(heading(page, "Stats", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-stats").first()).toBeVisible();
});

test("shows label and value", async ({ page }) => {
	const report = reports(page, "simple");

	await expect(report).toHaveCount(1);
	await expect(report.locator(".k-stat-label")).toHaveText("Revenue");
	await expect(report.locator(".k-stat-value")).toHaveText("€29,682");
	await expect(report.locator(".k-stat-info")).toHaveCount(0);
});

test("shows the info", async ({ page }) => {
	await expect(reports(page, "info").locator(".k-stat-info")).toHaveText(
		"+112.5%"
	);
});

test("applies the themes", async ({ page }) => {
	const themed = reports(page, "themes");

	await expect(themed.locator(".k-stat-label")).toHaveText([
		"None",
		"Positive",
		"Warning",
		"Notice",
		"Negative",
		"Info"
	]);

	for (const [index, theme] of [
		"positive",
		"warning",
		"notice",
		"negative",
		"info"
	].entries()) {
		await expect(themed.nth(index + 1)).toHaveAttribute("data-theme", theme);
	}
});

test("links reports", async ({ page }) => {
	await expect(field(page, "linked").getByRole("link")).toHaveAttribute(
		"href",
		"https://getkirby.com/buy"
	);
	await expect(field(page, "simple").getByRole("link")).toHaveCount(0);
});

test("uses the configured sizes", async ({ page }) => {
	await tab(page, "Sizes");

	for (const size of ["small", "medium", "large", "huge"]) {
		await expect(field(page, size).locator(".k-stats")).toHaveAttribute(
			"data-size",
			size
		);
		await expect(reports(page, size)).toHaveCount(5);
	}
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
