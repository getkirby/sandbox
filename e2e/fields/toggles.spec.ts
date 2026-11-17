import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+toggles");
});

test("renders the toggles fields", async ({ page }) => {
	await expect(heading(page, "Toggles", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-toggles").first()).toBeVisible();
});
