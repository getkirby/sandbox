import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+info");
});

test("renders the info fields", async ({ page }) => {
	await expect(heading(page, "Info", 1)).toBeVisible();
	await expect(page.locator(".k-info-field").first()).toBeVisible();
});
