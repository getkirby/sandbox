import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+color");
});

test("renders the color fields", async ({ page }) => {
	await expect(heading(page, "Color", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-color").first()).toBeVisible();
});
