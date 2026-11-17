import { expect, heading, test } from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+object");
});

test("renders the object fields", async ({ page }) => {
	await expect(heading(page, "Object", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-object").first()).toBeVisible();
});
