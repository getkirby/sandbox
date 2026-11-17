import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+number");
});

test("renders the number fields", async ({ page }) => {
	await expect(heading(page, "Number", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-number").first()).toBeVisible();
});
