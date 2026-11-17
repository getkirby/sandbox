import type { Page } from "@playwright/test";
import {
	dialog,
	drawer,
	dropdown,
	expect,
	heading,
	isolatedSession,
	item,
	openSettings,
	restoreAfterEach,
	save,
	test
} from "./fixtures.ts";

/**
 * Restores the lab accounts after each test and removes
 * all accounts created by the test (the admin account
 * is not part of the lab and stays untouched to keep
 * the session alive)
 */
restoreAfterEach("site/accounts", (account) => account !== "admin");

/**
 * Creates a new user via the dialog and returns its id
 */
const create = async (
	page: Page,
	{
		email,
		name = "",
		password = "",
		role = "Editor"
	}: { email: string; name?: string; password?: string; role?: string }
) => {
	await openCreate(page);

	const inputs = dialog(page).getByRole("textbox");
	await inputs.nth(0).fill(name);
	await inputs.nth(1).fill(email);
	await inputs.nth(2).fill(password);
	await dialog(page)
		.locator(".k-choice-input-label")
		.filter({ hasText: role })
		.click();
	await dialog(page).getByRole("button", { name: "Create" }).click();
	await expect(dialog(page)).toBeHidden();

	const href = await item(page, name || email)
		.getByRole("link")
		.first()
		.getAttribute("href");

	return href!.split("/").pop()!;
};

/**
 * Returns a button in the header of the user view
 * (exact names, as "Editor" is part of the email address)
 */
const header = (page: Page, name: string) =>
	page.getByRole("main").getByRole("button", { exact: true, name });

/**
 * Opens the dialog to create a new user
 */
const openCreate = async (page: Page) => {
	await page.goto("/panel/users");
	await page.getByRole("button", { name: "Add a new user" }).click();
};

/**
 * Opens the settings dropdown of the current user view
 * and picks the given option
 */
const settings = async (page: Page, option: string) => {
	const menu = await openSettings(page);
	await menu.getByRole("button", { name: option }).click();
};

const titles = (page: Page) => page.locator(".k-item-title");

test.describe("list", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/users");
	});

	test("lists all users with their roles", async ({ page }) => {
		await expect(titles(page)).toHaveText(["admin", "client", "editor"]);
		await expect(page.locator(".k-item-info")).toHaveText([
			"Admin",
			"Client",
			"Editor"
		]);
	});

	test("links to the user views", async ({ page }) => {
		await expect(item(page, "admin").getByRole("link")).toHaveAttribute(
			"href",
			/\/panel\/account$/
		);
		await expect(item(page, "editor").getByRole("link")).toHaveAttribute(
			"href",
			/\/panel\/users\/editor$/
		);

		await item(page, "editor").getByRole("link").click();
		await expect(heading(page, "editor", 1)).toBeVisible();
	});

	test("filters users by role", async ({ page }) => {
		const tabs = page.getByRole("main").getByRole("navigation").last();

		for (const [role, user] of [
			["Admin", "admin"],
			["Client", "client"],
			["Editor", "editor"]
		]) {
			await tabs.getByRole("link", { exact: true, name: role }).click();
			await expect(page).toHaveURL(new RegExp(`role=${role.toLowerCase()}`));
			await expect(titles(page)).toHaveText([user]);
		}

		await tabs.getByRole("link", { exact: true, name: "All" }).click();
		await expect(page.locator(".k-item")).toHaveCount(3);
	});

	test("shows the options of other users", async ({ page }) => {
		await item(page, "editor").getByRole("button", { name: "Options" }).click();

		await expect(dropdown(page)).toMatchAriaSnapshot(`
			- dialog:
			  - button "Rename this user"
			  - separator
			  - button "Change email"
			  - button "Change role"
			  - button "Change language"
			  - separator
			  - button "Security"
			  - separator
			  - button "Delete this user"
		`);
	});

	test("protects the own account", async ({ page }) => {
		await item(page, "admin").getByRole("button", { name: "Options" }).click();

		await expect(
			dropdown(page).getByRole("button", { name: "Change your name" })
		).toBeEnabled();
		await expect(
			dropdown(page).getByRole("button", { name: "Change role" })
		).toBeDisabled();
		await expect(
			dropdown(page).getByRole("button", { name: "Delete your account" })
		).toBeDisabled();
	});
});

test.describe("create", () => {
	test("offers all roles and languages", async ({ page }) => {
		await openCreate(page);

		await expect(dialog(page).locator(".k-choice-input-label")).toHaveText([
			/^Admin/,
			/^Client/,
			/^Editor/
		]);
		await expect(dialog(page).getByRole("combobox")).toHaveValue("en");
		await expect(
			dialog(page).getByRole("combobox").locator("option")
		).toContainText(["Deutsch", "English", "Français"]);
	});

	test("creates a new user", async ({ page }) => {
		const id = await create(page, {
			email: "homer@simpson.com",
			name: "Homer",
			password: "12345678",
			role: "Editor"
		});

		await expect(item(page, "Homer").locator(".k-item-info")).toHaveText(
			"Editor"
		);

		await page.goto(`/panel/users/${id}`);
		await expect(heading(page, "Homer", 1)).toBeVisible();
		await expect(header(page, "homer@simpson.com")).toBeVisible();
		await expect(header(page, "Editor")).toBeVisible();
		await expect(header(page, "English")).toBeVisible();
	});

	test("uses the email when no name is given", async ({ page }) => {
		await create(page, { email: "marge@simpson.com", role: "Client" });
		await expect(item(page, "marge@simpson.com")).toBeVisible();
	});

	test("requires a valid email address", async ({ page }) => {
		await openCreate(page);

		const email = dialog(page).locator(".k-field").nth(1);
		await expect(email.locator(".k-label-invalid")).toBeVisible();

		await email.getByRole("textbox").fill("homer");
		await expect(email.locator(".k-label-invalid")).toBeVisible();

		await email.getByRole("textbox").fill("homer@simpson.com");
		await expect(email.locator(".k-label-invalid")).toBeHidden();
	});

	test.describe("existing email", () => {
		// the failed request is logged to the console by the Panel
		test.use({ ignoreErrors: [/status of 400|already exists/] });

		test("rejects existing email addresses", async ({ page }) => {
			await openCreate(page);

			await dialog(page)
				.getByRole("textbox")
				.nth(1)
				.fill("editor@getkirby.com");
			await dialog(page).getByRole("button", { name: "Create" }).click();

			await expect(dialog(page)).toContainText("already exists");
			await expect(page.locator(".k-item")).toHaveCount(3);
		});
	});
});

test.describe("user view", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/users/editor");
		await expect(heading(page, "editor", 1)).toBeVisible();
	});

	test("shows the user details", async ({ page }) => {
		await expect(header(page, "editor@getkirby.com")).toBeVisible();
		await expect(header(page, "Editor")).toBeVisible();
		await expect(header(page, "English")).toBeVisible();
		await expect(header(page, "Profile picture")).toBeVisible();

		const tabs = page
			.getByRole("main")
			.getByRole("navigation")
			.filter({ has: page.getByRole("link", { name: "Content" }) });
		await expect(tabs.getByRole("link")).toHaveText(["Content", "Files"]);
		await expect(page.locator(".k-field-name-bio")).toBeVisible();
	});

	test("navigates to the previous user", async ({ page }) => {
		await page.getByRole("main").getByRole("link", { name: "client" }).click();

		await expect(page).toHaveURL(/\/panel\/users\/client$/);
		await expect(heading(page, "client", 1)).toBeVisible();
	});

	test("renames the user from the title", async ({ page }) => {
		await page
			.getByRole("main")
			.getByRole("heading", { level: 1 })
			.getByRole("button")
			.click();

		await dialog(page).getByRole("textbox").fill("Ned Flanders");
		await dialog(page).getByRole("button", { name: "Rename" }).click();

		await expect(heading(page, "Ned Flanders", 1)).toBeVisible();
	});

	test("changes the email address", async ({ page }) => {
		await header(page, "editor@getkirby.com").click();

		await expect(
			dialog(page).getByRole("link", { name: "Open" })
		).toHaveAttribute("href", "mailto:editor@getkirby.com");

		await dialog(page).getByRole("textbox").fill("ned@flanders.com");
		await dialog(page).getByRole("button", { name: "Change" }).click();

		await expect(header(page, "ned@flanders.com")).toBeVisible();
	});

	test("changes the role", async ({ page }) => {
		await header(page, "Editor").click();

		await expect(dialog(page).locator('input[value="editor"]')).toBeChecked();
		await dialog(page)
			.locator(".k-choice-input-label")
			.filter({ hasText: "Client" })
			.click();
		await dialog(page).getByRole("button", { name: "Change role" }).click();

		await expect(header(page, "Client")).toBeVisible();

		await page.goto("/panel/users?role=client");
		await expect(titles(page)).toHaveText(["client", "editor"]);
	});

	test("changes the language", async ({ page }) => {
		await header(page, "English").click();

		await dialog(page).getByRole("combobox").selectOption({ label: "Deutsch" });
		await dialog(page).getByRole("button", { name: "Change" }).click();

		await expect(header(page, "Deutsch")).toBeVisible();
	});

	test("saves content changes", async ({ page }) => {
		const bio = page.locator(".k-field-name-bio textarea");

		await bio.fill("Hi-diddly-ho, neighborino!");
		await save(page).click();
		await expect(save(page)).toBeHidden();

		await page.reload();
		await expect(bio).toHaveValue("Hi-diddly-ho, neighborino!");
	});

	test("uploads and removes the profile picture", async ({ page }) => {
		const chooser = page.waitForEvent("filechooser");
		await header(page, "Profile picture").click();
		await (
			await chooser
		).setFiles(
			"environments/lab/content/fields/filepicker/creatious-labs-1.jpg"
		);

		const image = header(page, "Profile picture").locator("img");
		await expect(image).toBeVisible();

		await header(page, "Profile picture").click();
		await dropdown(page).getByRole("button", { name: "Delete" }).click();
		await expect(image).toHaveCount(0);
	});

	test("shows the security settings", async ({ page }) => {
		await settings(page, "Security");

		await expect(drawer(page).getByRole("heading", { level: 2 })).toHaveText(
			["Account", "Sign in methods", "Two-factor methods"],
			{ useInnerText: true }
		);
		await expect(
			drawer(page).getByRole("button", { name: "Password" })
		).toBeVisible();
		await expect(
			drawer(page).getByRole("button", { name: "Authenticator app" })
		).toBeVisible();
	});

	test.describe("deletion", () => {
		// leaving the view of the deleted user still sends an unlock
		// request for its changes, which fails silently with a 404
		test.use({ ignoreErrors: [/status of 404/] });

		test("deletes the user", async ({ page }) => {
			await settings(page, "Delete this user");

			await expect(dialog(page)).toContainText(
				"Do you really want to delete editor@getkirby.com?"
			);
			await dialog(page).getByRole("button", { name: "Delete" }).click();

			await expect(page).toHaveURL(/\/panel\/users$/);
			await expect(titles(page)).toHaveText(["admin", "client"]);
		});
	});

	test("cancels the deletion", async ({ page }) => {
		await settings(page, "Delete this user");
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(dialog(page)).toBeHidden();
		await expect(heading(page, "editor", 1)).toBeVisible();
	});
});

test.describe("password", () => {
	isolatedSession("admin@getkirby.com");

	test("changes the password", async ({ page, session }) => {
		await page.goto("/panel/users/editor");
		await settings(page, "Security");
		await drawer(page).getByRole("button", { name: "Password" }).click();

		const inputs = dialog(page).getByRole("textbox");
		await expect(dialog(page)).toContainText("Account: admin@getkirby.com");
		await expect(dialog(page)).toContainText("Account: editor@getkirby.com");

		await inputs.nth(0).fill("12345678");
		await inputs.nth(1).fill("okilydokily");
		await inputs.nth(2).fill("okilydokily");
		await dialog(page).getByRole("button", { name: "Change password" }).click();
		await expect(dialog(page)).toBeHidden();

		// sign in with the new password in a separate session
		// (logging out here would end the shared admin session)
		const login = await (
			await session()
		).post("/api/auth/login", {
			data: { email: "editor@getkirby.com", password: "okilydokily" }
		});

		expect(login.ok()).toBe(true);
	});
});

test.describe("own account", () => {
	test("shows the account view", async ({ page }) => {
		await page.goto("/panel/account");

		await expect(heading(page, "admin", 1)).toBeVisible();
		await expect(header(page, "admin@getkirby.com")).toBeVisible();
		await expect(
			page.getByRole("main").getByRole("button", { name: "Theme" })
		).toBeVisible();

		// admins can't change their own role
		await expect(header(page, "Admin")).toBeDisabled();
	});
});

test.describe("permissions", () => {
	isolatedSession("client@getkirby.com");

	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/users");
	});

	test("only lists the own account for clients", async ({ page }) => {
		await expect(titles(page)).toHaveText(["client"]);
		await expect(
			page.getByRole("button", { name: "Add a new user" })
		).toBeDisabled();

		const tabs = page.getByRole("main").getByRole("navigation").last();
		await expect(tabs.getByRole("link")).toHaveText(["All", "Client"]);
	});

	test.describe("other users", () => {
		// the error view logs the 404 of its own request
		test.use({ ignoreErrors: [/status of 404/] });

		test("hides other users from clients", async ({ page }) => {
			await page.goto("/panel/users/editor");

			await expect(heading(page, "Error", 1)).toBeVisible();
			await expect(page.getByRole("main")).toContainText(
				'The user "editor" cannot be found'
			);
		});
	});
});
