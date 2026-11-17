import { existsSync, readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	discard,
	dropdown,
	expect,
	field,
	heading,
	restoreAfterEach,
	save,
	tab,
	test,
	titles
} from "./fixtures.ts";

/**
 * Restores the site content files after each test
 */
restoreAfterEach("content", (file) => /^site\..+\.txt$/.test(file));

const breadcrumb = (page: Page) =>
	page.getByRole("navigation", { name: "Breadcrumb" });

/**
 * Opens the rename dialog from the title of the site view
 */
const openRename = async (page: Page) => {
	await page
		.getByRole("main")
		.getByRole("heading", { level: 1 })
		.getByRole("button")
		.click();
};

const saveChanges = async (page: Page) => {
	await save(page).click();
	await expect(save(page)).toBeHidden();
};

const stored = (language = "en") =>
	readFileSync(`public/content/site.${language}.txt`, "utf8");

const text = (page: Page) => field(page, "text").locator("textarea");

test.describe("overview", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/site");
		await expect(heading(page, "Lab", 1)).toBeVisible();
	});

	test("shows the tabs and view buttons", async ({ page }) => {
		const tabs = page
			.getByRole("main")
			.getByRole("navigation")
			.filter({ has: page.getByRole("link", { name: "Overview" }) });

		await expect(tabs.getByRole("link")).toHaveText([
			"Overview",
			"Site Content",
			"Site Files"
		]);
		await expect(
			page.getByRole("main").getByRole("link", { name: "Preview" })
		).toHaveAttribute("href", /\/panel\/site\/preview\/form$/);
		await expect(
			page.getByRole("main").getByRole("link", { name: "Reference" })
		).toHaveAttribute("href", "https://getkirby.com/docs/reference");
	});

	test("lists the lab sections", async ({ page }) => {
		for (const name of ["fields", "other", "benchmarks"]) {
			await expect(field(page, name).locator(".k-item").first()).toBeVisible();
		}

		await expect(titles(page, "fields").first()).toHaveText("Blocks");

		// only the fields section allows new pages
		await expect(
			field(page, "fields").getByRole("button", { name: "Add" })
		).toBeVisible();
		await expect(
			field(page, "other").getByRole("button", { name: "Add" })
		).toHaveCount(0);
		await expect(
			field(page, "benchmarks").getByRole("button", { name: "Add" })
		).toHaveCount(0);
	});
});

test.describe("content", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/site");
		await tab(page, "Site Content");
		await expect(text(page)).toBeVisible();
	});

	test("shows the stored content", async ({ page }) => {
		await expect(text(page)).toHaveValue("");

		// the title is edited via the title dialog, not the form
		await expect(field(page, "title")).toHaveCount(0);
		await expect(save(page)).toHaveCount(0);
	});

	test("saves the text", async ({ page }) => {
		await text(page).fill("Welcome to the **lab**");
		await expect(field(page, "text").locator(".k-label")).toHaveAttribute(
			"data-has-diff",
			"true"
		);

		await saveChanges(page);

		expect(stored()).toContain("Text: Welcome to the **lab**");
		await page.reload();
		await expect(text(page)).toHaveValue("Welcome to the **lab**");
	});

	test("discards changes", async ({ page }) => {
		await text(page).fill("Never saved");
		await discard(page).click();
		await dialog(page).getByRole("button", { name: "Discard" }).click();

		await expect(text(page)).toHaveValue("");
		await expect(save(page)).toBeHidden();
		expect(stored()).not.toContain("Never saved");
	});

	test("renames the site from the title", async ({ page }) => {
		await openRename(page);
		await expect(dialog(page).locator("input")).toHaveValue("Lab");

		await dialog(page).locator("input").fill("Lab Renamed");
		await dialog(page).getByRole("button", { name: "Rename" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(heading(page, "Lab Renamed", 1)).toBeVisible();
		await expect(breadcrumb(page)).toHaveText("Lab Renamed");
		expect(stored()).toContain("Title: Lab Renamed");
	});

	test("updates the site name in the window title after renaming", async ({
		page
	}) => {
		await openRename(page);
		await dialog(page).locator("input").fill("Lab Renamed");
		await dialog(page).getByRole("button", { name: "Rename" }).click();
		await expect(heading(page, "Lab Renamed", 1)).toBeVisible();
		await expect(page).toHaveTitle("Lab Renamed | Lab Renamed");

		// other views use the new site name without reloading the Panel
		await page
			.getByRole("navigation", { name: "Menu" })
			.getByRole("link", { exact: true, name: "Users" })
			.click();
		await expect(heading(page, "Users", 1)).toBeVisible();
		await expect(page).toHaveTitle("Users | Lab Renamed");
	});

	test("requires a title when renaming", async ({ page }) => {
		await openRename(page);
		await dialog(page).locator("input").fill("");
		await expect(dialog(page).locator(".k-label-invalid")).toBeVisible();

		await dialog(page).getByRole("button", { name: "Rename" }).click();
		await expect(dialog(page)).toBeVisible();
		expect(stored()).toContain("Title: Lab");
	});
});

test.describe("languages", () => {
	test("switches to a secondary language", async ({ page }) => {
		await page.goto("/panel/site?tab=content");
		await page.getByRole("main").getByRole("button", { name: "EN" }).click();

		const languages = dropdown(page);
		await expect(languages.getByRole("button")).toHaveText([
			"English EN",
			/Malicious Deutsch.*DE$/,
			"RTL Language RT"
		]);

		await languages.getByRole("button").nth(1).click();
		await expect(page).toHaveURL(/language=de/);
		await expect(
			page.getByRole("main").getByRole("button", { exact: true, name: "DE" })
		).toBeVisible();
	});

	test("stores translations separately", async ({ page }) => {
		await page.goto("/panel/site?tab=content&language=de");

		// the default language is used as fallback
		await expect(heading(page, "Lab", 1)).toBeVisible();
		expect(existsSync("public/content/site.de.txt")).toBe(false);

		await text(page).fill("Hallo Welt");
		await saveChanges(page);

		expect(stored("de")).toContain("Text: Hallo Welt");
		expect(stored("en")).not.toContain("Hallo Welt");

		await page.goto("/panel/site?tab=content&language=en");
		await expect(text(page)).toHaveValue("");
	});

	test("edits right-to-left languages", async ({ page }) => {
		await page.goto("/panel/site?tab=content&language=rt");

		await expect(text(page)).toHaveAttribute("dir", "rtl");

		await page.goto("/panel/site?tab=content&language=en");
		await expect(text(page)).toHaveAttribute("dir", "ltr");
	});
});

test.describe("files", () => {
	test("lists the site files", async ({ page }) => {
		await page.goto("/panel/site");
		await tab(page, "Site Files");

		const files = titles(page, "files");
		await expect(files).toHaveText([
			"colors.json",
			"countries.json",
			"options.json"
		]);
		await expect(files.first().getByRole("link")).toHaveAttribute(
			"href",
			/\/panel\/site\/files\/colors\.json$/
		);

		await files.first().getByRole("link").click();
		await expect(page).toHaveURL(/\/panel\/site\/files\/colors\.json$/);
		await expect(heading(page, "colors.json", 1)).toBeVisible();
	});
});
