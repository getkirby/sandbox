import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+filelist");
});

test("renders the filelist fields", async ({ page }) => {
	await expect(heading(page, "Filelist", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-filelist").first()).toBeVisible();
});
