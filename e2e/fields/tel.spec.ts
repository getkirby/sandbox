import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+tel");
});

test("renders the tel fields", async ({ page }) => {
	await expect(heading(page, "Tel", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-tel").first()).toBeVisible();
});
