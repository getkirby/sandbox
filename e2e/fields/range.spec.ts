import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+range");
});

test("renders the range fields", async ({ page }) => {
	await expect(heading(page, "Range", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-range").first()).toBeVisible();
});
