import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+radio");
});

test("renders the radio fields", async ({ page }) => {
	await expect(heading(page, "Radio", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-radio").first()).toBeVisible();
});
