import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+pagelist");
});

test("renders the pagelist fields", async ({ page }) => {
	await expect(heading(page, "Pagelist", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-pagelist").first()).toBeVisible();
});
