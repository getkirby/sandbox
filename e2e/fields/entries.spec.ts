import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+entries");
});

test("renders the entries fields", async ({ page }) => {
	await expect(heading(page, "Entries", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-entries").first()).toBeVisible();
});
