import type { Page } from "@playwright/test";
import { expect, isolatedSession, test } from "../fixtures.ts";
import { restoreScenario, url } from "./helpers.ts";

restoreScenario();

const settings = async (page: Page, slug: string) => {
	await page.goto(url(slug));
	await page
		.locator(".k-view-buttons")
		.getByRole("button", { name: "Settings" })
		.click();

	return page.locator("dialog[open]").last();
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
		await expect(
			dropdown.getByRole("button", { name: "Rename" })
		).toBeEnabled();
		await expect(
			dropdown.getByRole("button", { name: "Change URL" })
		).toBeEnabled();
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

test.describe("changes of other users", () => {
	const api = "/api/pages/other+page-actions+page-to-rename/changes";
	const headers = { "x-csrf": "dev" };

	test("locks pages with unsaved changes of another user", async ({
		page,
		playwright
	}) => {
		// store unsaved changes as editor in a separate session
		// (request contexts inherit the admin's storage state by default,
		// so logging in would switch the shared admin session to the editor)
		const editor = await playwright.request.newContext({
			storageState: { cookies: [], origins: [] }
		});

		try {
			await editor.get("/env/auth/editor@getkirby.com");
			const response = await editor.post(`${api}/save?language=en`, {
				data: { text: "Editor change" },
				headers
			});
			expect(response.ok()).toBe(true);

			await page.goto(`${url("page-to-rename")}?language=en`);

			// the lock shows the editing user
			await expect(
				page.locator(".k-form-controls").getByRole("button")
			).toHaveText("editor@getkirby.com");

			// the form shows the editor's changes, but can't be edited
			await expect(page.locator(".k-field-name-text input")).toHaveValue(
				"Editor change"
			);
			await expect(page.locator(".k-field-name-text input")).toBeDisabled();

			// all page actions are blocked
			await expect(
				page
					.locator(".k-view-buttons")
					.getByRole("button", { name: "Settings" })
			).toBeDisabled();
			await expect(
				page.locator(".k-view-buttons").getByRole("button", { name: "Public" })
			).toBeDisabled();
		} finally {
			await editor.post(`${api}/discard?language=en`, { headers });
			await editor.dispose();
		}
	});
});
