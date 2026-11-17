import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, heading, test } from "./fixtures.ts";

const version: string = JSON.parse(
	readFileSync("kirby/composer.json", "utf8")
).version;

const plugins = [
	"getkirby/sandbox",
	"plugins/custom-file-preview",
	"plugins/custom-license-status",
	"plugins/custom-panel-components",
	"plugins/custom-panel-dialogs-drawers",
	"plugins/custom-textarea-buttons",
	"plugins/custom-view-buttons",
	"plugins/custom-writer-mark",
	"plugins/custom-writer-node",
	"plugins/field-dialogs-drawers"
];

const security = [
	"Debugging must be turned off in production",
	"The site is running locally with relaxed security checks",
	"The content salt has not been changed from its default value",
	"The cookie signing key has not been changed from its default value"
];

const dialog = (page: Page) => page.locator(".k-dialog");

const section = (page: Page, name: string) =>
	page
		.getByRole("main")
		.locator(".k-section")
		.filter({
			has: page.getByRole("heading", { level: 2, name: new RegExp(`^${name}`) })
		});

const stat = (page: Page, term: string) =>
	section(page, "Environment")
		.locator(".k-stat")
		.filter({ has: page.locator("dt", { hasText: term }) });

const plugin = (page: Page, name: string) =>
	section(page, "Plugins")
		.locator("tbody tr")
		.filter({ has: page.getByRole("cell", { exact: true, name }) });

test.describe("environment", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/system");
		await expect(heading(page, "System", 1)).toBeVisible();
	});

	test("shows the environment", async ({ page }) => {
		await expect(stat(page, "license").locator("dd")).toHaveText("Development");
		await expect(stat(page, "version").locator("dd")).toHaveText(version);
		await expect(stat(page, "PHP").locator("dd")).toHaveText(/^\d+\.\d+\.\d+/);
		await expect(stat(page, "Server").locator("dd")).not.toBeEmpty();
	});

	test("links to the release notes", async ({ page }) => {
		await expect(stat(page, "version")).toHaveAttribute(
			"href",
			`https://github.com/getkirby/kirby/releases/tag/${version}`
		);
	});

	test("copies the system info", async ({ context, page }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.getByRole("button", { name: "Copy info" }).click();

		await expect(page.locator(".k-panel-notification")).toHaveText(
			"System info copied"
		);

		const info = JSON.parse(
			await page.evaluate(() => navigator.clipboard.readText())
		);

		expect(info.info).toMatchObject({
			kirby: version,
			languages: ["de", "en", "rt"],
			license: "Development"
		});
		expect(info.security).toEqual(security);
		expect(info.plugins.map((p: { name: string }) => p.name)).toEqual(plugins);
	});

	test("shows the license details", async ({ page }) => {
		await stat(page, "license").click();

		await expect(
			dialog(page).getByRole("heading", { name: "License" })
		).toBeVisible();

		const details = dialog(page).locator("dl");
		await expect(details).toContainText("Development");
		await expect(details).toContainText("sandbox.test");
		await expect(
			dialog(page).getByRole("link", { name: "free license requirements" })
		).toHaveAttribute("href", "https://getkirby.com/license/free-licenses");
		await expect(
			dialog(page).getByRole("link", { name: "license hub" })
		).toHaveAttribute("href", "https://hub.getkirby.com/");
	});

	test("asks before removing the license", async ({ page }) => {
		await stat(page, "license").click();
		await dialog(page).getByRole("button", { name: "Remove" }).click();

		await expect(
			dialog(page).getByRole("button", { name: "Cancel" })
		).toBeVisible();
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		// the license is still active
		await page.reload();
		await expect(stat(page, "license").locator("dd")).toHaveText("Development");
	});
});

test.describe("security", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/system");
	});

	test("lists the security issues", async ({ page }) => {
		const items = section(page, "Security").locator(".k-item");

		await expect(items.locator(".k-item-title")).toHaveText(security);

		// the local environment is only an info, the defaults are notices
		await expect(items.nth(1)).toHaveAttribute("data-theme", "info");
		await expect(items.nth(2)).toHaveAttribute("data-theme", "notice");
		await expect(items.nth(3)).toHaveAttribute("data-theme", "notice");
	});

	test("links to the documentation", async ({ page }) => {
		const links = section(page, "Security").locator(".k-item-title a");

		await expect(links).toHaveCount(3);
		await expect(links.nth(0)).toHaveAttribute(
			"href",
			"https://getkirby.com/security/debug"
		);
		await expect(links.nth(1)).toHaveAttribute(
			"href",
			"https://getkirby.com/security/content-salt"
		);
		await expect(links.nth(2)).toHaveAttribute(
			"href",
			"https://getkirby.com/security/cookie-key"
		);
	});

	test("runs the checks again", async ({ page }) => {
		const reload = page.waitForRequest(
			(request) => new URL(request.url()).pathname === "/panel/system"
		);

		await page.getByRole("button", { name: "Try again" }).click();
		await reload;

		await expect(section(page, "Security").locator(".k-item-title")).toHaveText(
			security
		);
	});
});

test.describe("plugins", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/system");
	});

	test("lists all plugins", async ({ page }) => {
		await expect(
			section(page, "Plugins").locator('tbody td[data-column-id="name"]')
		).toHaveText(plugins);
		await expect(
			section(page, "Plugins").getByRole("link", { name: "Plugins" })
		).toHaveAttribute("href", "https://getkirby.com/plugins");
	});

	test("shows the plugin details", async ({ page }) => {
		const sandbox = plugin(page, "getkirby/sandbox");

		await expect(sandbox.locator("td")).toHaveText([
			"getkirby/sandbox",
			"Nico Hoffmann",
			"MIT",
			"Valid license",
			"2.0.0"
		]);

		// plugins without composer.json have unknown details
		await expect(
			plugin(page, "plugins/custom-file-preview").locator("td").nth(3)
		).toHaveText("Unknown");
	});

	test("supports custom license states", async ({ page }) => {
		const custom = plugin(page, "plugins/custom-license-status");

		await expect(
			custom.getByRole("link", { name: "Sandbox license" })
		).toHaveAttribute("href", "https://getkirby.com");

		await custom.getByRole("button", { name: "Get a license" }).click();
		await expect(dialog(page)).toContainText(
			"This dialog could be used for registering the custom plugin license."
		);
	});

	test("labels the license status column", async ({ page }) => {
		// Known bug: the `license.status` translation is missing.
		// Remove this line once fixed.
		test.fail();

		await expect(
			section(page, "Plugins").locator("thead th").nth(3)
		).not.toHaveText("license.status", { timeout: 1000 });
	});

	test("does not leak cell props as HTML attributes", async ({ page }) => {
		// Known bug: table cell components render their props
		// as attributes, e.g. `row="[object Object]"`.
		// Remove this line once fixed.
		test.fail();

		const cell = section(page, "Plugins")
			.locator(".k-table-update-status-cell")
			.first();

		await expect(cell).toBeVisible();
		await expect(cell).not.toHaveAttribute("row", { timeout: 1000 });
	});
});
