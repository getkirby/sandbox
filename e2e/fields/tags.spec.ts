import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+tags");
});

test("renders the tags fields", async ({ page }) => {
	await expect(heading(page, "Tags", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-tags").first()).toBeVisible();
});
