import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+time");
});

test("renders the time fields", async ({ page }) => {
	await expect(heading(page, "Time", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-time").first()).toBeVisible();
});
