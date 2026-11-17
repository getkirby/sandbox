import { existsSync } from "node:fs";
import { expect, test as setup } from "@playwright/test";
import { authFile } from "../playwright.config.ts";

/**
 * Kirby loads the Panel from the Vite dev server as long as
 * `npm run dev` runs in `kirby/panel` (which creates this flag)
 */
const viteFlag = "kirby/panel/.vite-running";

setup("check the Panel assets", async ({ request }) => {
	const html = await (await request.get("/panel/login")).text();
	const client = html.match(/src="([^"]+\/@vite\/client)"/)?.[1];

	if (client === undefined) {
		report("dist", "Panel assets: kirby/panel/dist (built)");
		return;
	}

	const origin = new URL(client).origin;
	let running = false;

	try {
		running = (await request.get(client, { timeout: 5000 })).ok();
	} catch {
		// the dev server is not reachable at all
	}

	expect(
		running,
		`The Panel is in dev mode, but the Vite dev server at ${origin} ` +
			"does not respond. Start it with `npm run dev` in kirby/panel" +
			(existsSync(viteFlag) === true
				? ` or remove the stale ${viteFlag} flag (it is left behind ` +
					"when Vite gets killed instead of stopped with Ctrl+C)."
				: ".")
	).toBe(true);

	report("dev", `Panel assets: Vite dev server at ${origin} (current source)`);
});

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

/**
 * Shows which Panel assets the run uses in the
 * terminal and as annotation in the HTML/UI reports
 */
const report = (type: "dev" | "dist", message: string) => {
	console.log(message);
	setup
		.info()
		.annotations.push({ description: message, type: `panel-${type}` });
};
