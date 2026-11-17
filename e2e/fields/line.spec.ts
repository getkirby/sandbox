import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+line");
});

test("renders the line fields", async ({ page }) => {
	await expect(heading(page, "Line", 1)).toBeVisible();
	await expect(page.locator(".k-line-field").first()).toBeVisible();
});
