import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+textarea");
});

test("renders the textarea fields", async ({ page }) => {
	await expect(heading(page, "Textarea", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-textarea").first()).toBeVisible();
});
