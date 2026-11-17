import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+list");
});

test("renders the list fields", async ({ page }) => {
	await expect(heading(page, "List", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-list").first()).toBeVisible();
});
