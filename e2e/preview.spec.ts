import type { Page } from "@playwright/test";
import {
	dialog,
	discard,
	expect,
	openSettingsDialog,
	readContent,
	restoreAfterEach,
	save,
	test,
	textbox
} from "./fixtures.ts";

/**
 * Restores the content of the preview page after each test
 */
restoreAfterEach("content/other/preview");

const api = "pages/other+preview";

type Version = "changes" | "latest";

const labels: Record<Version, string> = {
	changes: "Changed version",
	latest: "Latest version"
};

/**
 * Returns the preview browser for the given version
 */
const browser = (page: Page, version: Version) =>
	page
		.locator(".k-preview-browser")
		.filter({ has: page.getByRole("heading", { name: labels[version] }) });

const discardChanges = async (page: Page) => {
	await discard(page).click();
	await dialog(page).getByRole("button", { name: "Discard" }).click();
	await expect(discard(page)).toBeHidden();
};

/**
 * Returns the document in the visible iframe of a preview browser
 * (each browser swaps between two iframes to avoid flickering)
 */
const frame = (page: Page, version: Version) =>
	browser(page, version)
		.locator(".k-preview-browser-iframe.is-active")
		.contentFrame();

const headline = (page: Page, version: Version) =>
	frame(page, version).getByRole("heading", { level: 1 });

const open = async (page: Page, mode: string) => {
	await page.goto(`/panel/${api}/preview/${mode}`);
};

const rename = async (page: Page, title: string) => {
	await openSettingsDialog(page, "Rename");
	await dialog(page).locator(".k-field-name-title input").fill(title);
	await dialog(page).getByRole("button", { name: "Change" }).click();
	await expect(dialog(page)).toBeHidden();
};

const saveChanges = async (page: Page) => {
	await save(page).click();
	await expect(save(page)).toBeHidden();
	expect(readContent("other/preview/preview.en.txt").text).toBe("Changed");
};

const text = (page: Page, version: Version) =>
	frame(page, version).locator("[data-field=text]");

test.describe("changes mode", () => {
	test.beforeEach(async ({ changes, page }) => {
		await changes.store(api, { text: "Changed" });
		await open(page, "changes");
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("updates after discarding changes", async ({ page }) => {
		await discardChanges(page);
		await expect(text(page, "changes")).toHaveText("Original");
	});

	test("keeps showing saved changes", async ({ page }) => {
		await saveChanges(page);
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("updates after renaming the page", async ({ page }) => {
		await rename(page, "Renamed");
		await expect(headline(page, "changes")).toHaveText("Renamed");
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("keeps the scroll position after discarding changes", async ({
		page
	}) => {
		const scroll = () =>
			text(page, "changes").evaluate(() => Math.round(window.scrollY));

		await text(page, "changes").evaluate(() => window.scrollTo(0, 200));
		await expect.poll(scroll).toBe(200);

		await discardChanges(page);

		await expect(text(page, "changes")).toHaveText("Original");
		expect(await scroll()).toBe(200);
	});
});

test.describe("latest mode", () => {
	test.beforeEach(async ({ changes, page }) => {
		await changes.store(api, { text: "Changed" });
		await open(page, "latest");
		await expect(text(page, "latest")).toHaveText("Original");
	});

	test("updates after renaming the page", async ({ page }) => {
		await rename(page, "Renamed");
		await expect(headline(page, "latest")).toHaveText("Renamed");
		await expect(text(page, "latest")).toHaveText("Original");
	});
});

test.describe("compare mode", () => {
	test.beforeEach(async ({ changes, page }) => {
		await changes.store(api, { text: "Changed" });
		await open(page, "compare");
		await expect(text(page, "latest")).toHaveText("Original");
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("updates the changed version after discarding changes", async ({
		page
	}) => {
		await discardChanges(page);
		await expect(text(page, "changes")).toHaveText("Original");
		await expect(text(page, "latest")).toHaveText("Original");
	});

	test("updates the latest version after saving changes", async ({ page }) => {
		await saveChanges(page);
		await expect(text(page, "latest")).toHaveText("Changed");
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("updates both versions after renaming the page", async ({ page }) => {
		await rename(page, "Renamed");
		await expect(headline(page, "latest")).toHaveText("Renamed");
		await expect(headline(page, "changes")).toHaveText("Renamed");
	});
});

test.describe("form mode", () => {
	test.beforeEach(async ({ changes, page }) => {
		await changes.store(api, { text: "Changed" });
		await open(page, "form");
		await expect(text(page, "changes")).toHaveText("Changed");
	});

	test("updates after discarding changes", async ({ page }) => {
		await discardChanges(page);
		await expect(text(page, "changes")).toHaveText("Original");
	});

	test("updates while typing", async ({ changes, page }) => {
		await textbox(page, "text").fill("Edited");
		await changes.settled();
		await expect(text(page, "changes")).toHaveText("Edited");
	});

	test("updates after renaming the page", async ({ page }) => {
		await rename(page, "Renamed");
		await expect(headline(page, "changes")).toHaveText("Renamed");
	});
});

test.describe("switching modes", () => {
	test("updates after discarding changes in another mode", async ({
		changes,
		page
	}) => {
		await changes.store(api, { text: "Changed" });

		// start in the form mode and switch to the changes mode
		// without a reload, so that the view reuses its components
		await open(page, "form");
		await expect(text(page, "changes")).toHaveText("Changed");

		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Live editor" })
			.click();
		await page
			.locator("dialog[open]")
			.last()
			.getByRole("link", { name: "Changed version" })
			.click();

		await expect(page).toHaveURL(/\/preview\/changes$/);
		await expect(text(page, "changes")).toHaveText("Changed");

		await discardChanges(page);
		await expect(text(page, "changes")).toHaveText("Original");
	});
});
