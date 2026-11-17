import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+headline");
});

test("renders the headline fields", async ({ page }) => {
	await expect(heading(page, "Headline", 1)).toBeVisible();
	await expect(page.locator(".k-headline-field").first()).toBeVisible();
});
