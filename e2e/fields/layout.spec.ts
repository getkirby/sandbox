import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+layout");
});

test("renders the layout fields", async ({ page }) => {
	await expect(heading(page, "Layout", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-layout").first()).toBeVisible();
});
