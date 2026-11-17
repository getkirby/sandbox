import { expect, test as setup } from "@playwright/test";
import { authFile } from "../playwright.config.ts";

setup("install the lab environment", async ({ request }) => {
	const response = await request.get("/env/install/lab");
	const body = await response.text();

	// show the server's response if the installation fails
	expect(response.ok(), body).toBe(true);
	expect(body).toContain("has been installed");
});

setup("authenticate as admin", async ({ page }) => {
	await page.goto("/env/auth/admin@getkirby.com?panel");
	await page.waitForURL("**/panel/site");
	await page.context().storageState({ path: authFile });
});
