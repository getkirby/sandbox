import { expect, field, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+gap");
});

test("renders the gap fields", async ({ page }) => {
	await expect(heading(page, "Gap", 1)).toBeVisible();
	// gaps are empty spacers without any height
	await expect(page.locator(".k-gap-field")).toHaveCount(4);
});

test("keeps the space of the gap free", async ({ page }) => {
	const gaps = page.locator(".k-gap-field");

	for (const [index, name] of [
		[1, "oneHalf2"],
		[2, "oneThird3"],
		[3, "oneQuarter3"]
	] as const) {
		const gap = await gaps.nth(index).boundingBox();
		const next = await field(page, name).boundingBox();

		// the gap takes the space of a field in the same row,
		// so the following field starts after it
		expect(gap!.width).toBeCloseTo(next!.width, 0);
		expect(next!.x).toBeGreaterThan(gap!.x + gap!.width);
	}
});

test("contains nothing", async ({ page }) => {
	await expect(page.locator(".k-gap-field").first()).toBeEmpty();
});

test("does not leak field props as HTML attributes", async ({ page }) => {
	const element = page.locator(".k-gap-field").first();
	await expect(element).toBeAttached();

	// props like `endpoints` or `form-data` must not
	// end up as attributes, only the class is rendered
	expect(await element.evaluate((el) => el.getAttributeNames())).toEqual([
		"class"
	]);
});
