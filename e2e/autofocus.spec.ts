import type { Page } from "@playwright/test";
import {
	dialog,
	drawer,
	expect,
	field,
	openSettingsDialog,
	test
} from "./fixtures.ts";

/**
 * Returns a field in the open dialog
 */
const input = (page: Page, name: string) =>
	dialog(page).locator(`.k-field-name-${name}`).getByRole("textbox");

/**
 * Overlays (dialogs and drawers) focus the first element with
 * `[autofocus]`, then the first input, then the submit button,
 * instead of the first focusable element that `showModal()` picks
 */
test.describe("dialogs", () => {
	test("focuses the submit button of page deletions", async ({ page }) => {
		await page.goto("/panel/pages/other+page-actions+page-to-delete");
		await openSettingsDialog(page, "Delete");

		await expect(
			dialog(page).getByRole("button", { name: "Delete" })
		).toBeFocused();
	});

	test("focuses the submit button of file deletions", async ({ page }) => {
		await page.goto(
			"/panel/pages/fields+filepicker/files/creatious-labs-1.jpg"
		);
		await openSettingsDialog(page, "Delete");

		await expect(
			dialog(page).getByRole("button", { name: "Delete" })
		).toBeFocused();
	});

	test("focuses the submit button of user deletions", async ({ page }) => {
		await page.goto("/panel/users/client");
		await openSettingsDialog(page, "Delete");

		await expect(
			dialog(page).getByRole("button", { name: "Delete" })
		).toBeFocused();
	});

	test("focuses the first input", async ({ page }) => {
		await page.goto("/panel/pages/other+page-actions+page-to-rename");
		await openSettingsDialog(page, "Rename");

		await expect(input(page, "title")).toBeFocused();
	});

	test("focuses the selected field", async ({ page }) => {
		await page.goto("/panel/pages/other+page-actions+page-to-change-url");
		await openSettingsDialog(page, "Change URL");

		await expect(input(page, "slug")).toBeFocused();
	});

	test("focuses the URL input of the link dialog", async ({ page }) => {
		await page.goto("/panel/pages/fields+textarea");
		await field(page, "textarea")
			.getByRole("navigation")
			.getByRole("button", { exact: true, name: "Link" })
			.click();
		await expect(dialog(page)).toBeVisible();

		await expect(input(page, "href")).toBeFocused();
	});

	test("focuses the search of picker dialogs", async ({ page }) => {
		await page.goto("/panel/pages/fields+filepicker");
		await field(page, "filepicker")
			.getByRole("button", { exact: true, name: "Select" })
			.click();
		await expect(dialog(page)).toBeVisible();

		await expect(dialog(page).getByRole("searchbox")).toBeFocused();
	});
});

test.describe("drawers", () => {
	test("focuses the first input", async ({ page }) => {
		await page.goto("/panel/pages/fields+structure");
		await field(page, "simple")
			.getByRole("button", { name: "Add" })
			.first()
			.click();
		await expect(drawer(page)).toBeVisible();

		await expect(drawer(page).getByRole("textbox").first()).toBeFocused();
	});
});
