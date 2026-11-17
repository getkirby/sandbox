import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+writer");
});

test("renders the writer fields", async ({ page }) => {
	await expect(heading(page, "Writer", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-writer").first()).toBeVisible();
});
