import { defineConfig, devices } from "@playwright/test";

export const authFile = "e2e/.auth/admin.json";

export default defineConfig({
	forbidOnly: !!process.env.CI,
	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/
		},
		{
			dependencies: ["setup"],
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: authFile
			}
		}
	],
	reporter: process.env.CI ? "github" : "list",
	retries: process.env.CI ? 2 : 0,
	testDir: "e2e",
	use: {
		baseURL: process.env.SANDBOX_URL ?? "https://sandbox.test",
		ignoreHTTPSErrors: true,
		// DOM snapshots in the trace viewer cannot render the Panel's
		// external icon sprite, real screenshots can
		screenshot: "on",
		trace: "on-first-retry"
	},
	// all tests share the same sandbox installation
	workers: 1
});
