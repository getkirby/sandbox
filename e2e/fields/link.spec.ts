import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+link");
});

test("renders the link fields", async ({ page }) => {
	await expect(heading(page, "Link", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-link").first()).toBeVisible();
});
