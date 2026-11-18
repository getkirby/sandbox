import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	heading,
	invalid,
	openSettingsDialog,
	selectedText,
	test,
	titles
} from "../fixtures.ts";
import { content, folders, restoreScenario, url } from "./helpers.ts";

restoreScenario();

const change = (page: Page) =>
	dialog(page).getByRole("button", { name: "Change" });
const slug = (page: Page) => dialog(page).locator(".k-field-name-slug input");
const title = (page: Page) => dialog(page).locator(".k-field-name-title input");

/**
 * Renames the current page via the settings dropdown
 */
const rename = async (page: Page, value: string) => {
	await openSettingsDialog(page, "Rename");
	await title(page).fill(value);
	await change(page).click();
	await expect(dialog(page)).toBeHidden();
};

test.beforeEach(async ({ page }) => {
	// the content language is stored in the session,
	// so it's reset after the translation test
	await page.goto(`${url("page-to-rename")}?language=en`);
	await expect(heading(page, "Page to rename", 1)).toBeVisible();
});

test("shows the current title and URL", async ({ page }) => {
	await openSettingsDialog(page, "Rename");

	await expect(title(page)).toHaveValue("Page to rename");
	await expect(title(page)).toBeFocused();
	await expect(slug(page)).toHaveValue("page-to-rename");
	await expect(dialog(page)).toContainText(
		"/en/other/page-actions/page-to-rename"
	);
});

test("renames the page", async ({ page }) => {
	await openSettingsDialog(page, "Rename");
	await title(page).fill("Renamed page");

	// the URL is not changed automatically
	await expect(slug(page)).toHaveValue("page-to-rename");

	await change(page).click();
	await expect(dialog(page)).toBeHidden();

	await expect(heading(page, "Renamed page", 1)).toBeVisible();
	await expect(
		page
			.getByRole("navigation", { name: "Breadcrumb" })
			.getByRole("link")
			.last()
	).toHaveText("Renamed page");

	expect(content("2_page-to-rename").title).toBe("Renamed page");
	expect(folders()).toContain("2_page-to-rename");
});

test("updates the title in lists", async ({ page }) => {
	await rename(page, "Renamed page");

	await page.goto(url());
	await expect(titles(page, "pages").nth(1)).toHaveText("Renamed page");
});

test("keeps special characters", async ({ page }) => {
	await rename(page, `Ärger & "Freude" <3`);

	await expect(heading(page, `Ärger & "Freude" <3`, 1)).toBeVisible();
	expect(content("2_page-to-rename").title).toBe(`Ärger & "Freude" <3`);
});

test("requires a title", async ({ page }) => {
	await openSettingsDialog(page, "Rename");
	await title(page).fill("");

	await expect(invalid(page, "title")).toBeVisible();

	await change(page).click();
	await expect(dialog(page)).toBeVisible();
	expect(content("2_page-to-rename").title).toBe("Page to rename");
});

test("cancels renaming", async ({ page }) => {
	await openSettingsDialog(page, "Rename");
	await title(page).fill("Never saved");
	await dialog(page).getByRole("button", { name: "Cancel" }).click();

	await expect(heading(page, "Page to rename", 1)).toBeVisible();
	expect(content("2_page-to-rename").title).toBe("Page to rename");
});

test("renames from the title button", async ({ page }) => {
	await page
		.getByRole("main")
		.getByRole("heading", { level: 1 })
		.getByRole("button")
		.click();

	await expect(title(page)).toHaveValue("Page to rename");
});

test("renames translations separately", async ({ page }) => {
	await page.goto(`${url("page-to-rename")}?language=de`);
	await expect(heading(page, "Umzubenennende Seite", 1)).toBeVisible();

	await openSettingsDialog(page, "Rename");
	await expect(title(page)).toHaveValue("Umzubenennende Seite");
	await title(page).fill("Umbenannte Seite");
	await change(page).click();
	await expect(dialog(page)).toBeHidden();

	expect(content("2_page-to-rename", "de").title).toBe("Umbenannte Seite");
	expect(content("2_page-to-rename", "en").title).toBe("Page to rename");

	// switch the session back to the default language
	await page.goto(`${url("page-to-rename")}?language=en`);
});

test("selects the title when opening the dialog", async ({ page }) => {
	await openSettingsDialog(page, "Rename");
	await expect(title(page)).toBeFocused();
	await expect.poll(() => selectedText(title(page))).toBe("Page to rename");
});
