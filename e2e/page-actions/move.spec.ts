import type { Page } from "@playwright/test";
import { expect, heading, test } from "../fixtures.ts";
import {
	content,
	dialog,
	exists,
	openAction,
	restoreScenario,
	url
} from "./helpers.ts";

restoreScenario();

// leaving the view under its old URL still sends an unlock
// request for the old path (see issues/unlock-after-delete.md)
test.use({ ignoreErrors: [/status of 404/] });

const tree = (page: Page, name: string) =>
	dialog(page).getByRole("button", { exact: true, name });

/**
 * Opens the move dialog and expands the scenario page in the tree
 */
const openMove = async (page: Page, slug: string) => {
	await page.goto(url(slug));
	await openAction(page, "Move page");

	await tree(page, "Page Actions")
		.locator("xpath=preceding-sibling::button[1]")
		.click();
	await expect(tree(page, "Allowed move target")).toBeVisible();
};

const move = (page: Page) =>
	dialog(page).getByRole("button", { exact: true, name: "Move" });

test("only offers valid targets", async ({ page }) => {
	await openMove(page, "page-to-move");

	await expect(tree(page, "Allowed move target")).toBeEnabled();

	// only accepts subpages with another template
	await expect(tree(page, "Forbidden move target")).toBeDisabled();

	// a page can't be moved into itself
	await expect(tree(page, "Page to move")).toBeDisabled();

	// the site doesn't accept the template
	await expect(tree(page, "Site")).toBeDisabled();
});

test("moves the page to another parent", async ({ page }) => {
	await openMove(page, "page-to-move");
	await tree(page, "Allowed move target").click();
	await move(page).click();
	await expect(dialog(page)).toBeHidden();

	// the view follows the new URL
	await expect(page).toHaveURL(
		/\/panel\/pages\/other\+page-actions\+allowed-move-target\+page-to-move$/
	);
	await expect(heading(page, "Page to move", 1)).toBeVisible();

	expect(exists("5_page-to-move")).toBe(false);

	// the page keeps its sorting number in the new parent
	expect(exists("allowed-move-target/5_page-to-move")).toBe(true);
});

test("keeps the content when moving", async ({ page }) => {
	const before = content("1_page-with-children-and-files");

	await openMove(page, "page-with-children-and-files");
	await tree(page, "Allowed move target").click();
	await move(page).click();
	await expect(dialog(page)).toBeHidden();

	const moved = "allowed-move-target/1_page-with-children-and-files";

	expect(content(moved)).toEqual(before);

	// subpages and files move along
	expect(exists(`${moved}/1_child-a`)).toBe(true);
	expect(exists(`${moved}/file-a.jpg`)).toBe(true);
});

test("cancels moving", async ({ page }) => {
	await openMove(page, "page-to-move");
	await tree(page, "Allowed move target").click();
	await dialog(page).getByRole("button", { name: "Cancel" }).click();

	await expect(dialog(page)).toBeHidden();
	expect(exists("5_page-to-move")).toBe(true);
});

test("disables targets with a page of the same URL", async ({ page }) => {
	// the allowed target already contains a page with this URL
	await openMove(page, "page-with-taken-slug");
	await expect(tree(page, "Allowed move target")).toBeDisabled();
});

test("prevents moving pages without the move option", async ({ page }) => {
	await page.goto(url("page-without-actions"));
	await page
		.locator(".k-view-buttons")
		.getByRole("button", { name: "Settings" })
		.click();

	await expect(
		page
			.locator("dialog[open]")
			.last()
			.getByRole("button", { name: "Move page" })
	).toBeDisabled();
});
