import { expect, heading, tab, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+headline");
});

test("renders the headline fields", async ({ page }) => {
	await expect(heading(page, "Headline", 1)).toBeVisible();
	await expect(page.locator(".k-headline-field").first()).toBeVisible();
});

test("renders the labels as headings", async ({ page }) => {
	await expect(
		page.locator(".k-headline-field").getByRole("heading", { level: 2 })
	).toHaveText(["Headline", "Some Text", "With help"]);
});

test("shows the help text", async ({ page }) => {
	const field = page
		.locator(".k-headline-field")
		.filter({ hasText: "With help" });

	await expect(field.locator(".k-field-help")).toHaveText("Some help text …");
	await expect(
		page.locator(".k-headline-field").first().locator(".k-field-help")
	).toHaveCount(0);
});

test("aligns headlines by width", async ({ page }) => {
	await tab(page, "Widths");
	await expect(
		page.getByRole("heading", { exact: true, name: "One half 1" })
	).toBeVisible();

	const headlines = page.locator(".k-headline-field");
	const half1 = await headlines.nth(0).boundingBox();
	const half2 = await headlines.nth(1).boundingBox();

	expect(half2!.y).toBeCloseTo(half1!.y, 0);
	expect(half2!.width).toBeCloseTo(half1!.width, 0);
	expect(half2!.x).toBeGreaterThan(half1!.x);
});
