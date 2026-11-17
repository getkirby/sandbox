import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+blocks");
});

test("renders the blocks fields", async ({ page }) => {
	await expect(heading(page, "Blocks", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-blocks").first()).toBeVisible();
});
