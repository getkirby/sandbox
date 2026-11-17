import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+checkboxes");
});

test("renders the checkboxes fields", async ({ page }) => {
	await expect(heading(page, "Checkboxes", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-checkboxes").first()).toBeVisible();
});
