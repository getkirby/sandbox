import { expect, test } from "@playwright/test";

test("shows the lab site view", async ({ page }) => {
	await page.goto("/panel/site");
	await expect(page.getByRole("heading", { name: "Lab" })).toBeVisible();
});
