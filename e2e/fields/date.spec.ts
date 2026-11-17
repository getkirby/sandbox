import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+date");
});

test("renders the date fields", async ({ page }) => {
	await expect(heading(page, "Date", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-date").first()).toBeVisible();
});
