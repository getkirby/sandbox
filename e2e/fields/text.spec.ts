import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+text");
});

test("renders the text fields", async ({ page }) => {
	await expect(heading(page, "Text", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-text").first()).toBeVisible();
});
