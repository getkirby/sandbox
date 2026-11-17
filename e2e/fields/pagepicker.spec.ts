import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+pagepicker");
});

test("renders the pagepicker fields", async ({ page }) => {
	await expect(heading(page, "Pagepicker", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-pagepicker").first()).toBeVisible();
});
