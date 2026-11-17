import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+line");
});

test("renders the line fields", async ({ page }) => {
	await expect(heading(page, "Line", 1)).toBeVisible();
	await expect(page.locator(".k-line-field").first()).toBeVisible();
});

test("renders lines as separators", async ({ page }) => {
	const lines = page.getByRole("main").getByRole("separator");
	await expect(lines).toHaveCount(10);
});

test("aligns lines by width", async ({ page }) => {
	const lines = page.locator(".k-line-field");
	await expect(lines).toHaveCount(10);

	const boxes = await lines.evaluateAll((elements) =>
		elements.map((element) => element.getBoundingClientRect().toJSON())
	);

	const [full, half1, half2, third1, third2, third3, quarter1] = boxes;

	expect(half1.width).toBeLessThan(full.width);
	expect(half2.y).toBeCloseTo(half1.y, 0);
	expect(third2.y).toBeCloseTo(third1.y, 0);
	expect(third3.y).toBeCloseTo(third1.y, 0);
	expect(third1.width).toBeLessThan(half1.width);
	expect(quarter1.width).toBeLessThan(third1.width);
});

test("does not leak field props as HTML attributes", async ({ page }) => {
	// Known bug: the component lacks `inheritAttrs: false`, so props like
	// `endpoints` end up as attributes, e.g. `endpoints="[object Object]"`.
	// Remove this line once fixed.
	test.fail();

	const element = page.locator(".k-line-field").first();
	await expect(element).toBeAttached();
	await expect(element).not.toHaveAttribute("endpoints", { timeout: 1000 });
});
