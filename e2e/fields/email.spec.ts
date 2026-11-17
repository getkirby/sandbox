import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+email");
});

test("renders the email fields", async ({ page }) => {
	await expect(heading(page, "Email", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-email").first()).toBeVisible();
});
