import { expect, type Page, test } from "@playwright/test";

let errors: string[];

const heading = (page: Page, name: string, level: number) =>
	page.getByRole("main").getByRole("heading", { exact: true, level, name });

const open = async (page: Page, label: string) => {
	await page
		.getByRole("navigation", { name: "Menu" })
		.getByRole("link", { exact: true, name: label })
		.click();
};

test.beforeEach(async ({ page }) => {
	errors = [];

	page.on("console", (message) => {
		if (message.type() === "error") {
			errors.push(`Console error: ${message.text()}`);
		}
	});

	page.on("dialog", async (dialog) => {
		errors.push(`Unexpected dialog: ${dialog.message()}`);
		await dialog.dismiss();
	});

	page.on("pageerror", (error) => {
		errors.push(`Page error: ${error.message}`);
	});

	await page.goto("/panel");
});

test.afterEach(() => {
	expect(errors).toEqual([]);
});

test("Site", async ({ page }) => {
	await open(page, "Site");

	await expect(page).toHaveURL(/\/panel\/site$/);
	await expect(page).toHaveTitle("Lab | Lab");
	await expect(heading(page, "Lab", 1)).toBeVisible();

	const main = page.getByRole("main");
	await expect(main.getByRole("link", { name: "Overview" })).toBeVisible();
	await expect(main.getByRole("link", { name: "Site Content" })).toBeVisible();
	await expect(main.getByRole("link", { name: "Site Files" })).toBeVisible();
	await expect(heading(page, "Fields", 2)).toBeVisible();
	await expect(heading(page, "Blocks", 3)).toBeVisible();
});

test("Lab", async ({ page }) => {
	await open(page, "Lab");

	await expect(page).toHaveURL(/\/panel\/lab$/);
	await expect(page).toHaveTitle("Lab | Lab");
	await expect(heading(page, "Lab", 1)).toBeVisible();

	const main = page.getByRole("main");
	await expect(main.getByRole("searchbox", { name: "Filter …" })).toBeVisible();
	await expect(main.getByRole("link", { name: "Examples" })).toBeVisible();
	await expect(main.getByRole("link", { name: "Docs" })).toBeVisible();
	await expect(heading(page, "Basics", 2)).toBeVisible();
	await expect(heading(page, "Components", 2)).toBeVisible();
	await expect(heading(page, "buttons", 3)).toBeVisible();
});

test("Languages", async ({ page }) => {
	await open(page, "Languages");

	await expect(page).toHaveURL(/\/panel\/languages$/);
	await expect(page).toHaveTitle("Languages | Lab");
	await expect(heading(page, "Languages", 1)).toBeVisible();

	await expect(heading(page, "Default language", 2)).toBeVisible();
	await expect(heading(page, "English", 3)).toBeVisible();
	await expect(heading(page, "Secondary languages", 2)).toBeVisible();
	await expect(heading(page, "RTL Language", 3)).toBeVisible();

	// the malicious language name must be rendered as plain text
	const main = page.getByRole("main");
	await expect(main.getByText("Malicious Deutsch</strong>")).toBeVisible();
	await expect(main.locator("strong", { hasText: "Malicious" })).toHaveCount(0);
});

test("Users", async ({ page }) => {
	await open(page, "Users");

	await expect(page).toHaveURL(/\/panel\/users$/);
	await expect(page).toHaveTitle("Users | Lab");
	await expect(heading(page, "Users", 1)).toBeVisible();

	const main = page.getByRole("main");

	for (const role of ["All", "Admin", "Client", "Editor"]) {
		await expect(
			main.getByRole("link", { exact: true, name: role })
		).toBeVisible();
	}

	for (const user of ["admin", "client", "editor"]) {
		await expect(heading(page, user, 3)).toBeVisible();
	}
});

test("System", async ({ page }) => {
	await open(page, "System");

	await expect(page).toHaveURL(/\/panel\/system$/);
	await expect(page).toHaveTitle("System | Lab");
	await expect(heading(page, "System", 1)).toBeVisible();

	await expect(heading(page, "Environment", 2)).toBeVisible();
	await expect(heading(page, "Security", 2)).toBeVisible();
	await expect(heading(page, "Plugins", 2)).toBeVisible();

	const main = page.getByRole("main");
	await expect(main.getByRole("term").filter({ hasText: "PHP" })).toBeVisible();
	await expect(
		main.getByRole("row").filter({ hasText: "getkirby/sandbox" })
	).toBeVisible();
});

test("Your account", async ({ page }) => {
	await open(page, "Your account");

	await expect(page).toHaveURL(/\/panel\/account$/);
	await expect(page).toHaveTitle("admin | Lab");
	await expect(heading(page, "admin", 1)).toBeVisible();

	const main = page.getByRole("main");
	await expect(
		main.getByRole("button", { name: "admin@getkirby.com" })
	).toBeVisible();
	await expect(
		main.getByRole("button", { exact: true, name: "Admin" })
	).toBeDisabled();
	await expect(main.getByRole("link", { name: "Content" })).toBeVisible();
	await expect(main.getByRole("link", { name: "Files" })).toBeVisible();
	await expect(main.getByRole("textbox", { name: "Bio" })).toBeVisible();
});
