import { readdirSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	heading,
	openSettingsDialog,
	readContent,
	test
} from "../fixtures.ts";
import { content, exists, restoreScenario, scenario, url } from "./helpers.ts";

restoreScenario();

const source = "1_page-with-children-and-files";
const copy = "_drafts/page-with-children-and-files-copy";

const confirm = (page: Page) =>
	dialog(page).getByRole("button", { name: "Duplicate" });

const duplicate = async (
	page: Page,
	{ children = false, files = false } = {}
) => {
	await page.goto(url("page-with-children-and-files"));
	await openSettingsDialog(page, "Duplicate");

	if (files === true) {
		await toggle(page, "files").click();
	}

	if (children === true) {
		await toggle(page, "children").click();
	}

	await confirm(page).click();
	await expect(dialog(page)).toBeHidden();
};

const entries = (path: string) =>
	readdirSync(`public/content/${scenario}/${path}`).sort();

const toggle = (page: Page, name: string) =>
	dialog(page).locator(`.k-field-name-${name} .k-choice-input-label`);

test("suggests a title and URL for the copy", async ({ page }) => {
	await page.goto(url("page-with-children-and-files"));
	await openSettingsDialog(page, "Duplicate");

	await expect(dialog(page).locator(".k-field-name-title input")).toHaveValue(
		"Page with children and files Copy"
	);
	await expect(dialog(page).locator(".k-field-name-slug input")).toHaveValue(
		"page-with-children-and-files-copy"
	);
	await expect(toggle(page, "files")).toHaveText("off");
	await expect(toggle(page, "children")).toHaveText("off");
});

test("duplicates the page as draft", async ({ page }) => {
	await duplicate(page);

	// opens the copy
	await expect(page).toHaveURL(
		/\/panel\/pages\/other\+page-actions\+page-with-children-and-files-copy$/
	);
	await expect(
		heading(page, "Page with children and files Copy", 1)
	).toBeVisible();

	const original = content(source);
	const duplicated = content(copy);

	expect(duplicated.title).toBe("Page with children and files Copy");
	expect(duplicated.text).toBe(original.text);

	// the copy gets its own UUID
	expect(duplicated.uuid).toMatch(/^\w{16}$/);
	expect(duplicated.uuid).not.toBe(original.uuid);

	// without files or children
	expect(entries(copy)).toEqual(["page-actions-default.en.txt"]);
});

test("copies the files", async ({ page }) => {
	await duplicate(page, { files: true });

	expect(entries(copy)).toEqual([
		"file-a.jpg",
		"file-a.jpg.en.txt",
		"file-b.pdf",
		"file-b.pdf.en.txt",
		"page-actions-default.en.txt"
	]);

	// copied files get new UUIDs
	const original = readContent(`${scenario}/${source}/file-a.jpg.en.txt`);
	const duplicated = readContent(`${scenario}/${copy}/file-a.jpg.en.txt`);
	expect(duplicated.uuid).not.toBe(original.uuid);
});

test("copies the children", async ({ page }) => {
	await duplicate(page, { children: true });

	expect(entries(copy)).toEqual([
		"1_child-a",
		"2_child-b",
		"page-actions-default.en.txt"
	]);

	// copied children get new UUIDs
	expect(content(`${copy}/1_child-a`).uuid).not.toBe(
		content(`${source}/1_child-a`).uuid
	);
});

test("duplicates drafts", async ({ page }) => {
	await page.goto(url("draft-to-duplicate"));
	await openSettingsDialog(page, "Duplicate");
	await confirm(page).click();
	await expect(dialog(page)).toBeHidden();

	expect(exists("_drafts/draft-to-duplicate-copy")).toBe(true);
	expect(exists("_drafts/draft-to-duplicate")).toBe(true);
});

test.describe("taken URLs", () => {
	// the rejected request is logged to the console by the Panel
	test.use({ ignoreErrors: [/status of 400|already exists/] });

	test("rejects URLs of existing pages", async ({ page }) => {
		await page.goto(url("page-with-children-and-files"));
		await openSettingsDialog(page, "Duplicate");
		await dialog(page)
			.locator(".k-field-name-slug input")
			.fill("page-with-taken-slug");
		await confirm(page).click();

		await expect(dialog(page)).toContainText("already exists");
		expect(exists("_drafts/page-with-taken-slug")).toBe(false);
	});
});
