import type { Page } from "@playwright/test";
import { expect, field, tab, test, titles } from "../fixtures.ts";
import { modelListTests } from "./models.ts";

modelListTests({
	info: /^\d+ × \d+$/,
	items: [
		"creatious-labs-1.jpg",
		"creatious-labs-2.jpg",
		"water.mp3",
		"water-glass.mp4",
		"camera.glb",
		"kirby.pdf"
	],
	options: `
		- dialog:
		  - link "Open"
		  - separator
		  - button "Rename"
		  - button "Change position"
		  - button "Change template"
		  - separator
		  - button "Replace"
		  - separator
		  - button "Delete"
	`,
	search: ["water", ["water.mp3", "water-glass.mp4"]],
	title: "Filelist",
	type: "filelist",
	url: "/panel/pages/fields+filelist/files/creatious-labs-1.jpg"
});

test("hides the upload button", async ({ page }) => {
	await expect(titles(page, "listWithoutCreate")).toHaveCount(6);
	await expect(
		field(page, "listWithoutCreate").getByRole("button", { name: "Add" })
	).toHaveCount(0);
	await expect(
		field(page, "list").getByRole("button", { name: "Add" })
	).toBeVisible();
});

test("sorts files by size", async ({ page }) => {
	await tab(page, "Sorting");

	await expect(titles(page, "sortBy")).toHaveText([
		"camera.glb",
		"water-glass.mp4",
		"water.mp3",
		"creatious-labs-2.jpg",
		"creatious-labs-1.jpg",
		"kirby.pdf"
	]);
});

test("filters files by query", async ({ page }) => {
	await tab(page, "Queries");

	await expect(titles(page, "queryImages")).toHaveText([
		"creatious-labs-1.jpg",
		"creatious-labs-2.jpg"
	]);
	await expect(titles(page, "queryDocuments")).toHaveText(["kirby.pdf"]);
});

test.describe("empty state", () => {
	const empty = (page: Page) =>
		field(page, "empty").getByRole("button", { name: "No files yet" });

	test.beforeEach(async ({ page }) => {
		await tab(page, "Empty");
	});

	test("opens the file picker on click", async ({ page }) => {
		const chooser = page.waitForEvent("filechooser");
		await empty(page).click();
		await chooser;
	});

	test("opens the file picker via keyboard", async ({ page }) => {
		const chooser = page.waitForEvent("filechooser");
		await empty(page).focus();
		await page.keyboard.press("Enter");
		await chooser;
	});
});
