import { existsSync, readdirSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, readContent, restoreContent, test } from "../fixtures.ts";

/**
 * The lab page with all page action scenarios
 */
export const scenario = "other/page-actions";

/**
 * Panel URL of the scenario page or one of its subpages,
 * e.g. `url("page-to-rename")`
 */
export const url = (...slugs: string[]) =>
	["/panel/pages/other+page-actions", ...slugs].join("+");

export const dialog = (page: Page) => page.locator(".k-dialog");

/**
 * Picks an option from the settings dropdown of the current view
 */
export const openAction = async (page: Page, option: string) => {
	await page
		.locator(".k-view-buttons")
		.getByRole("button", { name: "Settings" })
		.click();
	await page
		.locator("dialog[open]")
		.last()
		.getByRole("button", { name: option })
		.click();
	await expect(dialog(page)).toBeVisible();
};

/**
 * Returns the subpage folders of the scenario page
 * (or one of its subpages), e.g. `["1_page-to-rename", …]`
 */
export const folders = (path = "") =>
	readdirSync(`public/content/${scenario}/${path}`, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

export const exists = (path: string) =>
	existsSync(`public/content/${scenario}/${path}`);

/**
 * Reads the content of a page in the scenario,
 * e.g. `content("2_page-to-rename")`
 */
export const content = (folder: string, language = "en") =>
	readContent(`${scenario}/${folder}/page-actions-default.${language}.txt`);

/**
 * Restores the scenario after each test of the spec
 */
export const restoreScenario = () => {
	test.afterEach(() => restoreContent(scenario));
};
