import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+filepicker");
});

test("renders the filepicker fields", async ({ page }) => {
	await expect(heading(page, "Filepicker", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-filepicker").first()).toBeVisible();
});
