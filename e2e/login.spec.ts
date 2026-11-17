import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, heading, test } from "./fixtures.ts";

// all tests start logged out
test.use({ storageState: { cookies: [], origins: [] } });

// failed logins (403) and requests after logging
// out (401) are logged to the console by the Panel
test.use({ ignoreErrors: [/status of 40[13]/] });

const email = (page: Page) => page.locator('input[name="email"]');
const password = (page: Page) => page.locator('input[name="password"]');
const submit = (page: Page) => page.getByRole("button", { name: "Log in" });
const alert = (page: Page) => page.locator(".k-login-alert");

const login = async (page: Page, user: string, pass: string) => {
	await email(page).fill(user);
	await password(page).fill(pass);
	await submit(page).click();
};

/**
 * The time in seconds until the session cookie expires
 */
const sessionLifetime = async (page: Page) => {
	const cookies = await page.context().cookies();
	const session = cookies.find((cookie) => cookie.name === "kirby_session");

	expect(session).toBeDefined();
	return session!.expires - Date.now() / 1000;
};

/**
 * Removes the log of failed login attempts, so that
 * the tests never lock out any account or IP
 */
test.afterEach(() => {
	rmSync("public/site/accounts/.logins", { force: true });
});

test.beforeEach(async ({ page }) => {
	await page.goto("/panel");
});

test("redirects to the login view", async ({ page }) => {
	await expect(page).toHaveURL(/\/panel\/login\/method\/password$/);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Log in");
	await expect(page.getByRole("navigation", { name: "Menu" })).toHaveCount(0);
});

test("shows the login form", async ({ page }) => {
	await expect(email(page)).toHaveAttribute("type", "email");
	await expect(email(page)).toHaveAttribute("autocomplete", "email");
	await expect(password(page)).toHaveAttribute("type", "password");
	await expect(password(page)).toHaveAttribute(
		"autocomplete",
		"current-password"
	);
	await expect(
		page.getByRole("checkbox", { name: "Keep me logged in" })
	).not.toBeChecked();

	// the sandbox prefills the admin credentials
	await expect(email(page)).toHaveValue("admin@getkirby.com");
	await expect(password(page)).toHaveValue("12345678");
});

test("logs in with email and password", async ({ page }) => {
	await login(page, "admin@getkirby.com", "12345678");

	await expect(page).toHaveURL(/\/panel\/site$/);
	await expect(page.getByRole("navigation", { name: "Menu" })).toBeVisible();
});

test("logs in with the enter key", async ({ page }) => {
	await password(page).press("Enter");
	await expect(page).toHaveURL(/\/panel\/site$/);
});

test("logs in as other users", async ({ page }) => {
	await login(page, "editor@getkirby.com", "12345678");
	await expect(page).toHaveURL(/\/panel\/site$/);

	await page.goto("/panel/account");
	await expect(heading(page, "editor", 1)).toBeVisible();
});

test("returns to the requested view after login", async ({ page }) => {
	await page.goto("/panel/users");
	await expect(page).toHaveURL(/\/panel\/login/);

	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/users$/);
	await expect(heading(page, "Users", 1)).toBeVisible();
});

test("rejects wrong passwords", async ({ page }) => {
	await login(page, "admin@getkirby.com", "wrongpassword");

	await expect(alert(page)).toContainText("Invalid login");
	await expect(page).toHaveURL(/\/panel\/login/);
	await expect(page.getByRole("navigation", { name: "Menu" })).toHaveCount(0);
});

test("does not reveal unknown accounts", async ({ page }) => {
	await login(page, "nobody@getkirby.com", "12345678");

	// same message as for wrong passwords
	await expect(alert(page)).toContainText("Invalid login");
});

test("validates the form before sending it", async ({ page }) => {
	const requests: string[] = [];
	page.on("request", (request) => {
		if (request.method() === "POST") {
			requests.push(request.url());
		}
	});

	// the login form deliberately hides the required and
	// invalid markers, so the native validity is checked
	const isValid = (input: ReturnType<typeof email>) =>
		input.evaluate((element: HTMLInputElement) => element.validity.valid);

	await email(page).fill("admin");
	expect(await isValid(email(page))).toBe(false);
	await submit(page).click();

	await email(page).fill("admin@getkirby.com");
	await password(page).fill("short");
	expect(await isValid(password(page))).toBe(false);
	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/login/);
	expect(requests).toEqual([]);
});

test("keeps users logged in when asked", async ({ page }) => {
	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/site$/);
	const short = await sessionLifetime(page);

	await page.context().clearCookies();
	await page.goto("/panel");
	await page.getByRole("checkbox", { name: "Keep me logged in" }).check({
		force: true
	});
	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/site$/);
	const long = await sessionLifetime(page);

	// default sessions last hours, long ones days
	expect(short).toBeLessThan(60 * 60 * 24);
	expect(long).toBeGreaterThan(60 * 60 * 24);
});

test("redirects logged in users away from the login view", async ({ page }) => {
	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/site$/);

	await page.goto("/panel/login");
	await expect(page).toHaveURL(/\/panel\/site$/);
});

test("logs out", async ({ page }) => {
	await submit(page).click();
	await expect(page).toHaveURL(/\/panel\/site$/);

	await page
		.getByRole("navigation", { name: "Menu" })
		.getByRole("link", { name: "Log out" })
		.click();
	await expect(page).toHaveURL(/\/panel\/login/);

	// the session is gone
	await page.goto("/panel/users");
	await expect(page).toHaveURL(/\/panel\/login/);
});
