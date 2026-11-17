import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+select");
});

test("renders the select fields", async ({ page }) => {
	await expect(heading(page, "Select", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-select").first()).toBeVisible();
});
