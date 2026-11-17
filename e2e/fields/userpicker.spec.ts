import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+userpicker");
});

test("renders the userpicker fields", async ({ page }) => {
	await expect(heading(page, "Userpicker", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-userpicker").first()).toBeVisible();
});
