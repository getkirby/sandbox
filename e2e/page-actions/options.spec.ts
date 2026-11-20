import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	isolatedSession,
	openSettings,
	test,
	viewButton
} from "../fixtures.ts";
import { restoreScenario, url } from "./helpers.ts";

restoreScenario();

const settings = async (page: Page, slug: string) => {
	await page.goto(url(slug));
	return openSettings(page);
};

test("disables all actions via blueprint options", async ({ page }) => {
	await expect(await settings(page, "page-without-actions"))
		.toMatchAriaSnapshot(`
		- dialog:
		  - button "Rename" [disabled]
		  - button "Change URL" [disabled]
		  - button "Change status" [disabled]
		  - button "Change position" [disabled]
		  - button "Change template" [disabled]
		  - separator
		  - button "Move page" [disabled]
		  - button "Duplicate" [disabled]
		  - separator
		  - button "Delete" [disabled]
	`);
});

test("keeps the URL of pages with a fixed slug", async ({ page }) => {
	const dropdown = await settings(page, "page-with-fixed-slug");

	await expect(
		dropdown.getByRole("button", { name: "Change URL" })
	).toBeDisabled();

	await dropdown.getByRole("button", { name: "Rename" }).click();
	await expect(dialog(page)).toBeVisible();

	await expect(dialog(page).locator(".k-field-name-title input")).toBeEnabled();
	await expect(dialog(page).locator(".k-field-name-slug input")).toBeDisabled();
	await expect(
		dialog(page).getByRole("button", { name: "Create from title" })
	).toHaveCount(0);
});

test("allows admins to use admin-only actions", async ({ page }) => {
	const dropdown = await settings(page, "page-with-admin-only-actions");

	for (const action of ["Move page", "Duplicate", "Delete"]) {
		await expect(dropdown.getByRole("button", { name: action })).toBeEnabled();
	}
});

test.describe("editors", () => {
	isolatedSession("editor@getkirby.com");

	test("can't use admin-only actions", async ({ page }) => {
		const dropdown = await settings(page, "page-with-admin-only-actions");

		for (const action of ["Move page", "Duplicate", "Delete"]) {
			await expect(
				dropdown.getByRole("button", { name: action })
			).toBeDisabled();
		}

		// all other actions are still available
		for (const action of ["Rename", "Change URL"]) {
			await expect(
				dropdown.getByRole("button", { name: action })
			).toBeEnabled();
		}
	});

	test("can use all actions on regular pages", async ({ page }) => {
		const dropdown = await settings(page, "page-to-move");

		for (const action of ["Rename", "Move page", "Duplicate", "Delete"]) {
			await expect(
				dropdown.getByRole("button", { name: action })
			).toBeEnabled();
		}
	});
});

test("locks pages with unsaved changes of another user", async ({
	changes,
	page,
	session
}) => {
	await changes.store(
		"pages/other+page-actions+page-to-rename",
		{ text: "Editor change" },
		{ request: await session("editor@getkirby.com") }
	);

	await page.goto(`${url("page-to-rename")}?language=en`);

	// the lock shows the editing user
	await expect(page.locator(".k-form-controls").getByRole("button")).toHaveText(
		"editor@getkirby.com"
	);

	// the form shows the editor's changes, but can't be edited
	await expect(page.locator(".k-field-name-text input")).toHaveValue(
		"Editor change"
	);
	await expect(page.locator(".k-field-name-text input")).toBeDisabled();

	// all page actions are blocked
	await expect(viewButton(page, "Settings")).toBeDisabled();
	await expect(viewButton(page, "Public")).toBeDisabled();
});
