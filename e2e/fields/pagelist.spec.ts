import { dialog, expect, field, test } from "../fixtures.ts";
import { items, modelListTests } from "./models.ts";

modelListTests({
	info: /^test-page-b$/,
	items: ["Test Page B", "Test Page A", "Test Page C", "Test Page D"],
	options: `
		- dialog:
		  - link "Open"
		  - link "Preview"
		  - separator
		  - button "Rename"
		  - button "Change URL"
		  - button "Change status"
		  - button "Change position"
		  - button "Change template"
		  - separator
		  - button "Move page"
		  - button "Duplicate"
		  - separator
		  - button "Delete"
	`,
	search: ["test-page-c", ["Test Page C"]],
	title: "Pagelist",
	type: "pagelist",
	url: "/panel/pages/fields+pagelist+test-page-b"
});

test("shows the page status", async ({ page }) => {
	const statuses = items(page, "list").getByRole("button", {
		name: /^Status:/
	});

	await expect(statuses).toHaveText(["", "", "", ""]);
	await expect(statuses.nth(0)).toHaveAccessibleName("Status: Public");
	await expect(statuses.nth(1)).toHaveAccessibleName("Status: Unlisted");
	await expect(statuses.nth(2)).toHaveAccessibleName("Status: Draft");
});

test("opens the page creation dialog", async ({ page }) => {
	await field(page, "list").getByRole("button", { name: "Add" }).click();

	await expect(dialog(page)).toBeVisible();
	await expect(dialog(page).getByRole("textbox").first()).toBeVisible();

	await dialog(page).getByRole("button", { name: "Cancel" }).click();
	await expect(dialog(page)).toBeHidden();
});
