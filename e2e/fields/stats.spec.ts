import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+stats");
});

test("renders the stats fields", async ({ page }) => {
	await expect(heading(page, "Stats", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-stats").first()).toBeVisible();
});
