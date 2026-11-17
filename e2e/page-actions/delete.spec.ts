import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	openSettingsDialog,
	test,
	titles
} from "../fixtures.ts";
import { exists, folders, restoreScenario, url } from "./helpers.ts";

restoreScenario();

// leaving the view of the deleted page still sends an unlock
// request for it, which fails with a 404 (see issues/unlock-after-delete.md)
test.use({ ignoreErrors: [/status of 404/] });

const parent = /\/panel\/pages\/other\+page-actions$/;

const remove = (page: Page) =>
	dialog(page).getByRole("button", { name: "Delete" });

test("deletes pages after confirmation", async ({ page }) => {
	await page.goto(url("page-to-delete"));
	await openSettingsDialog(page, "Delete");

	await expect(dialog(page)).toContainText(
		"Do you really want to delete Page to delete?"
	);
	await remove(page).click();

	// redirects to the parent page
	await expect(page).toHaveURL(parent);
	expect(exists("page-to-delete")).toBe(false);
	await expect(titles(page, "pages")).not.toContainText(["Page to delete"]);
});

test("cancels the deletion", async ({ page }) => {
	await page.goto(url("page-to-delete"));
	await openSettingsDialog(page, "Delete");
	await dialog(page).getByRole("button", { name: "Cancel" }).click();

	await expect(dialog(page)).toBeHidden();
	expect(exists("page-to-delete")).toBe(true);
});

test.describe("pages with subpages", () => {
	// the rejected request is logged to the console by the Panel
	test.use({ ignoreErrors: [/status of 40[04]|enter the page title/] });

	test.beforeEach(async ({ page }) => {
		await page.goto(url("page-with-children-and-files"));
		await openSettingsDialog(page, "Delete");
	});

	test("requires the title to delete pages with subpages", async ({ page }) => {
		await expect(dialog(page)).toContainText(
			"This page has subpages. All subpages will be deleted as well."
		);

		// without the title, the page is not deleted
		await remove(page).click();
		await expect(dialog(page)).toContainText(
			"Please enter the page title to confirm"
		);
		expect(exists("1_page-with-children-and-files")).toBe(true);

		await dialog(page)
			.getByRole("textbox")
			.fill("Page with children and files");
		await remove(page).click();

		await expect(page).toHaveURL(parent);
		expect(exists("1_page-with-children-and-files")).toBe(false);
	});

	test("renumbers the remaining listed pages", async ({ page }) => {
		await dialog(page)
			.getByRole("textbox")
			.fill("Page with children and files");
		await remove(page).click();
		await expect(page).toHaveURL(parent);

		expect(folders().filter((folder) => /^\d+_/.test(folder))).toEqual([
			"1_page-to-rename",
			"2_page-to-change-url",
			"3_page-with-taken-slug",
			"4_page-to-move"
		]);
	});
});

test("deletes drafts", async ({ page }) => {
	await page.goto(url("draft-to-duplicate"));
	await openSettingsDialog(page, "Delete");
	await remove(page).click();

	await expect(page).toHaveURL(parent);
	expect(exists("_drafts/draft-to-duplicate")).toBe(false);
});
