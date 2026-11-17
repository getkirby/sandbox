import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const buttons = (page: Page, name: string) =>
	field(page, name).getByRole("link");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+buttons");
});

test("renders the buttons fields", async ({ page }) => {
	await expect(heading(page, "Buttons", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-buttons").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(field(page, "buttons").locator(".k-empty")).toHaveText(
		"No buttons"
	);
});

test("renders the buttons as links", async ({ page }) => {
	await expect(buttons(page, "simple")).toHaveText([
		"Button A",
		"Button B",
		"Button C"
	]);

	for (const button of await buttons(page, "simple").all()) {
		await expect(button).toHaveAttribute("href", "https://getkirby.com");
	}
});

test("shows the button icons", async ({ page }) => {
	const icons = buttons(page, "icons").locator(".k-button-icon .k-icon");

	await expect(icons.nth(0)).toHaveAttribute("data-type", "heart");
	await expect(icons.nth(1)).toHaveAttribute("data-type", "star");
	await expect(icons.nth(2)).toHaveAttribute("data-type", "badge");
});

test("applies the themes", async ({ page }) => {
	for (const [name, suffix] of [
		["themes", ""],
		["themesIcon", "-icon"]
	]) {
		const themed = buttons(page, name);

		await expect(themed.nth(0)).toHaveAttribute(
			"data-theme",
			`positive${suffix}`
		);
		await expect(themed.nth(1)).toHaveAttribute(
			"data-theme",
			`negative${suffix}`
		);
		await expect(themed.nth(2)).toHaveAttribute("data-theme", `info${suffix}`);
	}
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
