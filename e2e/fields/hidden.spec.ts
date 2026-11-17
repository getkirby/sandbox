import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+hidden");
});

test("renders the hidden fields", async ({ page }) => {
	await expect(heading(page, "Hidden", 1)).toBeVisible();
	// hidden fields are not rendered at all
	await expect(page.getByRole("main").locator(".k-field")).toHaveCount(0);
});

test("does not render inputs for hidden fields", async ({ page }) => {
	await expect(heading(page, "Hidden", 1)).toBeVisible();
	await expect(page.locator('[name="hidden"]')).toHaveCount(0);
});
