import { existsSync, readdirSync } from "node:fs";
import { readContent, restoreAfterEach } from "../fixtures.ts";

/**
 * The lab page with all page action scenarios
 */
export const scenario = "other/page-actions";

/**
 * Reads the content of a page in the scenario,
 * e.g. `content("2_page-to-rename")`
 */
export const content = (folder: string, language = "en") =>
	readContent(`${scenario}/${folder}/page-actions-default.${language}.txt`);

/**
 * Checks if a file or folder exists in the scenario,
 * e.g. `exists("_drafts/draft-to-duplicate")`
 */
export const exists = (path: string) =>
	existsSync(`public/content/${scenario}/${path}`);

/**
 * Returns the subpage folders of the scenario page
 * (or one of its subpages), e.g. `["1_page-to-rename", …]`
 */
export const folders = (path = "") =>
	readdirSync(`public/content/${scenario}/${path}`, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

/**
 * Restores the scenario after each test of the spec
 */
export const restoreScenario = () => restoreAfterEach(`content/${scenario}`);

/**
 * Panel URL of the scenario page or one of its subpages,
 * e.g. `url("page-to-rename")`
 */
export const url = (...slugs: string[]) =>
	["/panel/pages/other+page-actions", ...slugs].join("+");
