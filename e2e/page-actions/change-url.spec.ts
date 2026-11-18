import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	heading,
	invalid,
	openSettings,
	openSettingsDialog,
	test
} from "../fixtures.ts";
import { content, exists, folders, restoreScenario, url } from "./helpers.ts";

restoreScenario();

const change = (page: Page) =>
	dialog(page).getByRole("button", { name: "Change" });
const slug = (page: Page) => dialog(page).locator(".k-field-name-slug input");

test.beforeEach(async ({ page }) => {
	await page.goto(`${url("page-to-change-url")}?language=en`);
	await expect(heading(page, "Page to change URL", 1)).toBeVisible();
});

test.describe("new URL", () => {
	test("changes the URL", async ({ page }) => {
		await openSettingsDialog(page, "Change URL");
		await expect(slug(page)).toHaveValue("page-to-change-url");

		await slug(page).fill("new-url");
		await expect(dialog(page)).toContainText("/en/other/page-actions/new-url");
		await change(page).click();
		await expect(dialog(page)).toBeHidden();

		// the view follows the new URL
		await expect(page).toHaveURL(
			/\/panel\/pages\/other\+page-actions\+new-url/
		);

		// the folder keeps its sorting number
		expect(folders()).toContain("3_new-url");
		expect(exists("3_page-to-change-url")).toBe(false);
		expect(content("3_new-url").title).toBe("Page to change URL");
	});
});

test("sanitizes the URL", async ({ page }) => {
	await openSettingsDialog(page, "Change URL");
	await slug(page).fill("");
	// special characters are covered by the slug field tests
	await slug(page).pressSequentially("Neue URL & Farben");

	await expect(slug(page)).toHaveValue("neue-url-farben");
});

test("creates the URL from the title", async ({ page }) => {
	await openSettingsDialog(page, "Change URL");
	await dialog(page).locator(".k-field-name-title input").fill("Fresh Title");
	await dialog(page).getByRole("button", { name: "Create from title" }).click();

	await expect(slug(page)).toHaveValue("fresh-title");
});

test("requires a URL", async ({ page }) => {
	await openSettingsDialog(page, "Change URL");
	await slug(page).fill("");

	await expect(invalid(page, "slug")).toBeVisible();
	await change(page).click();
	await expect(dialog(page)).toBeVisible();
	expect(exists("3_page-to-change-url")).toBe(true);
});

test.describe("taken URLs", () => {
	// the rejected request is logged to the console by the Panel
	test.use({ ignoreErrors: [/status of 400|already exists/] });

	test("rejects URLs of sibling pages", async ({ page }) => {
		await openSettingsDialog(page, "Change URL");
		await slug(page).fill("page-with-taken-slug");
		await change(page).click();

		await expect(dialog(page)).toContainText(
			'A page with the URL appendix "page-with-taken-slug" already exists'
		);
		expect(exists("3_page-to-change-url")).toBe(true);
	});
});

test("changes translated URLs separately", async ({ page }) => {
	await page.goto(`${url("page-to-change-url")}?language=de`);
	await openSettingsDialog(page, "Change URL");

	await expect(slug(page)).toHaveValue("url-aendern");
	await slug(page).fill("neue-adresse");
	await change(page).click();
	await expect(dialog(page)).toBeHidden();

	// the folder keeps the slug of the default language
	expect(exists("3_page-to-change-url")).toBe(true);
	expect(content("3_page-to-change-url", "de").slug).toBe("neue-adresse");
	expect(content("3_page-to-change-url", "en").slug).toBeUndefined();

	// switch the session back to the default language
	await page.goto(`${url("page-to-change-url")}?language=en`);
});

test("keeps the URL of the home page", async ({ page }) => {
	await page.goto("/panel/pages/home");
	const settings = await openSettings(page);

	await expect(
		settings.getByRole("button", { name: "Change URL" })
	).toBeDisabled();
});

test("focuses the URL when opening the dialog", async ({ page }) => {
	await openSettingsDialog(page, "Change URL");

	// Known bug: the `preselect` prop of the field is not exported
	// by the backend, so the title is focused instead of the URL.
	// Remove this line once fixed.
	test.fail();

	await expect(slug(page)).toBeFocused({ timeout: 1000 });
});
