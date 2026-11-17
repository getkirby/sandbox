import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+multiselect");
});

test("renders the multiselect fields", async ({ page }) => {
	await expect(heading(page, "Multiselect", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-multiselect").first()).toBeVisible();
});
