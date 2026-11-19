import type { Page } from "@playwright/test";
import {
	dialog,
	dropdown,
	expect,
	heading,
	item,
	restoreAfterEach,
	test,
	viewButton
} from "./fixtures.ts";

/**
 * Restores the language files of the lab after each test,
 * which also removes all languages created by the test
 */
restoreAfterEach("site/languages");

/**
 * Creates a new language via the dialog
 */
const create = async (
	page: Page,
	name: string,
	{ code, direction }: { code?: string; direction?: string } = {}
) => {
	await page.goto("/panel/languages");
	await page.getByRole("button", { name: "Add a new language" }).click();

	const inputs = dialog(page).getByRole("textbox");
	await inputs.nth(0).fill(name);

	if (code !== undefined) {
		await inputs.nth(1).fill(code);
	}

	if (direction !== undefined) {
		await dialog(page).getByRole("combobox").selectOption({ label: direction });
	}

	await dialog(page)
		.getByRole("button", { name: "Add a new language" })
		.click();
	await expect(dialog(page)).toBeHidden();
};

const definition = (page: Page, term: string) =>
	page
		.getByRole("main")
		.locator(".k-stat")
		.filter({
			has: page.locator("dt", { hasText: new RegExp(`^\\s*${term}\\s*$`) })
		})
		.locator("dd");

const options = async (page: Page, name: string) => {
	await item(page, name).getByRole("button", { name: "Options" }).click();
	return dropdown(page);
};

const variable = (page: Page, key: string) =>
	variables(page).filter({
		has: page.getByRole("cell", { exact: true, name: key })
	});

/**
 * Opens the options dropdown of a variable and picks the given option
 */
const variableOption = async (page: Page, key: string, option: string) => {
	await variable(page, key).getByRole("button", { name: "Options" }).click();
	await dropdown(page).getByRole("button", { name: option }).click();
};

const variables = (page: Page) => page.getByRole("main").locator("tbody tr");

test.describe("list", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/languages");
	});

	test("lists the default and secondary languages", async ({ page }) => {
		const sections = page.getByRole("main").getByRole("heading", { level: 2 });
		await expect(sections).toHaveText(
			["Default language", "Secondary languages"],
			{ useInnerText: true }
		);

		await expect(item(page, "English")).toContainText("en");
		await expect(item(page, "RTL Language")).toContainText("rt");
		await expect(page.locator(".k-item")).toHaveCount(3);
	});

	test("opens the language view", async ({ page }) => {
		const link = item(page, "English").getByRole("link");

		// a real link, so it can also be opened in a new tab
		await expect(link).toHaveAttribute("href", /\/panel\/languages\/en$/);
		await link.click();

		await expect(page).toHaveURL(/\/panel\/languages\/en$/);
		await expect(heading(page, "English", 1)).toBeVisible();
	});

	test("does not allow deleting the default language", async ({ page }) => {
		await expect(await options(page, "English")).toMatchAriaSnapshot(`
			- dialog:
			  - button "Edit"
			  - button "Settings"
		`);
		await page.keyboard.press("Escape");

		await expect(await options(page, "RTL Language")).toMatchAriaSnapshot(`
			- dialog:
			  - button "Edit"
			  - button "Settings"
			  - button "Delete"
		`);
	});
});

test.describe("add", () => {
	test("suggests code and locale from the name", async ({ page }) => {
		await page.goto("/panel/languages");
		await page.getByRole("button", { name: "Add a new language" }).click();

		const inputs = dialog(page).getByRole("textbox");
		await inputs.nth(0).fill("Français");

		await expect(inputs.nth(1)).toHaveValue("fr");
		await expect(inputs.nth(2)).toHaveValue("fr_FR");
		await expect(dialog(page).getByRole("combobox")).toHaveValue("ltr");
	});

	test("creates a new language", async ({ page }) => {
		await create(page, "Français");

		await expect(item(page, "Français")).toContainText("fr");
		await expect(
			page
				.locator(".k-item")
				.filter({ hasText: "Français" })
				.locator("xpath=ancestor::section[1]")
				.getByRole("heading", { level: 2 })
		).toHaveText("Secondary languages", { useInnerText: true });
	});

	test("creates a right-to-left language", async ({ page }) => {
		await create(page, "עברית", { code: "he", direction: "Right to left" });

		await page.goto("/panel/languages/he");
		await expect(definition(page, "Reading direction")).toHaveText(
			"Right to left"
		);
	});

	test("requires name and code", async ({ page }) => {
		await page.goto("/panel/languages");
		await page.getByRole("button", { name: "Add a new language" }).click();

		const fields = dialog(page).locator(".k-field");
		await expect(fields.nth(0).locator(".k-label-invalid")).toBeVisible();
		await expect(fields.nth(1).locator(".k-label-invalid")).toBeVisible();

		await dialog(page)
			.getByRole("button", { name: "Add a new language" })
			.click();
		await expect(dialog(page)).toBeVisible();
	});

	test.describe("existing codes", () => {
		// the failed request is logged to the console by the Panel
		// (a single pattern, as Playwright reads arrays of two
		// as a fixture value with options)
		test.use({
			ignoreErrors: [/status of 400|The language already exists/]
		});

		test("rejects existing language codes", async ({ page }) => {
			await page.goto("/panel/languages");
			await page.getByRole("button", { name: "Add a new language" }).click();

			const inputs = dialog(page).getByRole("textbox");
			await inputs.nth(0).fill("English 2");
			await inputs.nth(1).fill("en");
			await dialog(page)
				.getByRole("button", { name: "Add a new language" })
				.click();

			await expect(dialog(page)).toContainText("The language already exists");
			await expect(page.locator(".k-item")).toHaveCount(3);
		});
	});
});

test.describe("language view", () => {
	test("shows the language settings", async ({ page }) => {
		await page.goto("/panel/languages/en");

		await expect(definition(page, "Status")).toHaveText("Default language");
		await expect(definition(page, "Code")).toHaveText("en");
		await expect(definition(page, "PHP locale string")).toHaveText("en_EN");
		await expect(definition(page, "Reading direction")).toHaveText(
			"Left to right"
		);
		await expect(
			page.getByRole("main").getByRole("link", { name: "Open" })
		).toHaveAttribute("href", /\/en$/);

		// the default language can't be deleted
		await expect(
			page.getByRole("main").getByRole("button", { name: "Delete" })
		).toHaveCount(0);
	});

	test("shows the settings of secondary languages", async ({ page }) => {
		await page.goto("/panel/languages/rt");

		await expect(definition(page, "Status")).toHaveText("Secondary language");
		await expect(definition(page, "Reading direction")).toHaveText(
			"Right to left"
		);
		await expect(
			page.getByRole("main").getByRole("button", { name: "Delete" })
		).toBeVisible();
	});

	test("navigates to the other languages", async ({ page }) => {
		await page.goto("/panel/languages/en");
		await page
			.getByRole("main")
			.getByRole("link", { name: "RTL Language" })
			.click();

		await expect(page).toHaveURL(/\/panel\/languages\/rt$/);
		await expect(heading(page, "RTL Language", 1)).toBeVisible();

		await page.getByRole("main").getByRole("link", { name: "English" }).click();
		await expect(page).toHaveURL(/\/panel\/languages\/en$/);
	});
});

test.describe("edit", () => {
	test("changes the language settings", async ({ page }) => {
		await create(page, "Français");
		await page.goto("/panel/languages/fr");
		await viewButton(page, "Settings").click();

		const inputs = dialog(page).getByRole("textbox");
		await expect(inputs.nth(1)).toBeDisabled();
		await expect(inputs.nth(1)).toHaveValue("fr");

		await inputs.nth(0).fill("Français (France)");
		await dialog(page).getByRole("combobox").selectOption({
			label: "Right to left"
		});
		await inputs.nth(2).fill("fr_CA");
		await dialog(page).getByRole("button", { name: "Save" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(heading(page, "Français (France)", 1)).toBeVisible();
		await expect(definition(page, "PHP locale string")).toHaveText("fr_CA");
		await expect(definition(page, "Reading direction")).toHaveText(
			"Right to left"
		);
	});

	test("opens the settings from the title", async ({ page }) => {
		await page.goto("/panel/languages/en");
		await page
			.getByRole("main")
			.getByRole("heading", { level: 1 })
			.getByRole("button")
			.click();

		await expect(dialog(page).getByRole("textbox").first()).toHaveValue(
			"English"
		);
	});

	test("opens the settings from the list", async ({ page }) => {
		await page.goto("/panel/languages");
		await (
			await options(page, "RTL Language")
		)
			.getByRole("button", { name: "Settings" })
			.click();

		await expect(dialog(page).getByRole("textbox").first()).toHaveValue(
			"RTL Language"
		);
	});
});

test.describe("variables", () => {
	test("lists the variables", async ({ page }) => {
		await page.goto("/panel/languages/en");

		await expect(variables(page)).toHaveCount(3);
		await expect(variable(page, "option.a")).toContainText("Option A");
	});

	test("adds, edits and deletes variables", async ({ page }) => {
		await page.goto("/panel/languages/en");

		// add
		await page
			.getByRole("main")
			.getByRole("button", { exact: true, name: "Add" })
			.click();
		await dialog(page).getByRole("textbox").nth(0).fill("greeting");
		await dialog(page).getByRole("textbox").nth(1).fill("Hello");
		await dialog(page).getByRole("button", { name: "Save" }).click();

		await expect(variable(page, "greeting")).toContainText("Hello");
		await expect(variables(page)).toHaveCount(4);

		// edit
		await variableOption(page, "greeting", "Edit");
		await expect(dialog(page).getByRole("textbox").nth(0)).toBeDisabled();
		await dialog(page).getByRole("textbox").nth(1).fill("Howdy");
		await dialog(page).getByRole("button", { name: "Save" }).click();

		await expect(variable(page, "greeting")).toContainText("Howdy");

		// delete
		await variableOption(page, "greeting", "Delete");
		await dialog(page).getByRole("button", { name: "Delete" }).click();

		await expect(variable(page, "greeting")).toHaveCount(0);
		await expect(variables(page)).toHaveCount(3);
	});

	test("offers multiple values for countable variables", async ({ page }) => {
		await page.goto("/panel/languages/en");
		await page
			.getByRole("main")
			.getByRole("button", { exact: true, name: "Add" })
			.click();

		await dialog(page).getByRole("textbox").first().fill("apples");
		await dialog(page).getByRole("checkbox").check({ force: true });

		await expect(dialog(page).locator(".k-field-type-entries")).toBeVisible();
		await expect(dialog(page)).toContainText(
			"Use the - placeholder to insert the actual count"
		);
	});

	test("translates variables in secondary languages", async ({ page }) => {
		await page.goto("/panel/languages/rt");

		// keys of the default language are listed without values
		await expect(variables(page)).toHaveCount(3);
		await expect(variable(page, "option.a").locator("td").nth(2)).toHaveText(
			""
		);

		await variable(page, "option.a")
			.getByRole("button", { name: "Options" })
			.click();

		const menu = dropdown(page);
		// keys are managed by the default language
		await expect(menu.getByRole("button", { name: "Delete" })).toBeDisabled();
		await menu.getByRole("button", { name: "Edit" }).click();

		await expect(dialog(page).getByRole("textbox").nth(0)).toBeDisabled();
		await dialog(page).getByRole("textbox").nth(1).fill("خيار أ");
		await dialog(page).getByRole("button", { name: "Save" }).click();

		await expect(variable(page, "option.a")).toContainText("خيار أ");
	});
});

test.describe("delete", () => {
	test("deletes languages from the list", async ({ page }) => {
		await create(page, "Français");

		await (
			await options(page, "Français")
		)
			.getByRole("button", { name: "Delete" })
			.click();

		await expect(dialog(page)).toContainText(
			"Do you really want to delete the language Français including all translations?"
		);
		await dialog(page).getByRole("button", { name: "Delete" }).click();

		await expect(item(page, "Français")).toHaveCount(0);
		await expect(page.locator(".k-item")).toHaveCount(3);
	});

	test("deletes languages from their view", async ({ page }) => {
		await create(page, "Français");
		await page.goto("/panel/languages/fr");

		await page
			.getByRole("main")
			.getByRole("button", { name: "Delete" })
			.click();
		await dialog(page).getByRole("button", { name: "Delete" }).click();

		await expect(page).toHaveURL(/\/panel\/languages$/);
		await expect(item(page, "Français")).toHaveCount(0);
	});

	test("cancels the deletion", async ({ page }) => {
		await create(page, "Français");

		await (
			await options(page, "Français")
		)
			.getByRole("button", { name: "Delete" })
			.click();
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(item(page, "Français")).toBeVisible();
	});
});
