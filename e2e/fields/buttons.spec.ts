import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+buttons");
});

test("renders the buttons fields", async ({ page }) => {
	await expect(heading(page, "Buttons", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-buttons").first()).toBeVisible();
});
