import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+gap");
});

test("renders the gap fields", async ({ page }) => {
	await expect(heading(page, "Gap", 1)).toBeVisible();
	// gaps are empty spacers without any height
	await expect(page.locator(".k-gap-field")).toHaveCount(4);
});
