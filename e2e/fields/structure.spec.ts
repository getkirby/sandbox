import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+structure");
});

test("renders the structure fields", async ({ page }) => {
	await expect(heading(page, "Structure", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-structure").first()).toBeVisible();
});
