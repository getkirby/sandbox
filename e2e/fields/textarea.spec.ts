import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test,
	textbox
} from "../fixtures.ts";

const button = (page: Page, name: string, label: string) =>
	toolbar(page, name).getByRole("button", { exact: true, name: label });

const toolbar = (page: Page, name: string) =>
	field(page, name).getByRole("navigation");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+textarea");
});

test("renders the textarea fields", async ({ page }) => {
	await expect(heading(page, "Textarea", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-textarea").first()).toBeVisible();
});

test("shows the default toolbar", async ({ page }) => {
	await expect(toolbar(page, "textarea")).toMatchAriaSnapshot(`
		- navigation:
		  - button "Headings"
		  - separator
		  - button "Bold"
		  - button "Italic"
		  - button "Code"
		  - separator
		  - button "Link"
		  - button "Email"
		  - button "File"
		  - separator
		  - button "Bullet list"
		  - button "Ordered list"
	`);
});

test("formats the selected text", async ({ page }) => {
	const input = textbox(page, "textarea");

	await input.fill("Kirby");
	await input.selectText();
	await button(page, "textarea", "Bold").click();
	await expect(input).toHaveValue("**Kirby**");

	await input.fill("Kirby");
	await input.selectText();
	await button(page, "textarea", "Italic").click();
	await expect(input).toHaveValue("*Kirby*");
});

test("hides the toolbar without buttons", async ({ page }) => {
	await expect(textbox(page, "noButtons")).toBeVisible();
	await expect(toolbar(page, "noButtons")).toHaveCount(0);
});

test("uses the monospace font", async ({ page }) => {
	await expect(textbox(page, "monospace")).toHaveAttribute(
		"data-font",
		"monospace"
	);
	await expect(textbox(page, "textarea")).toHaveAttribute(
		"data-font",
		"sans-serif"
	);
});

test("shows placeholder, icon and help", async ({ page }) => {
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Write something …"
	);
	await expect(field(page, "icon").locator(".k-input-icon")).toBeVisible();
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("disables inputs and their toolbar", async ({ page }) => {
	for (const name of [
		"disabled",
		"disabledWithValue",
		"disabledWithPlaceholder"
	]) {
		await expect(textbox(page, name)).toBeDisabled();
		await expect(toolbar(page, name)).toHaveCount(0);
	}

	await expect(textbox(page, "disabledWithValue")).toHaveValue(
		"This is a value"
	);
	await expect(textbox(page, "disabledWithPlaceholder")).toHaveAttribute(
		"placeholder",
		"Disabled with placeholder"
	);
});

test("shows the counter", async ({ page }) => {
	await textbox(page, "textarea").fill("Kirby");
	await expect(field(page, "textarea").locator(".k-field-counter")).toHaveText(
		"5"
	);

	await textbox(page, "disabledCounter").fill("Kirby");
	await expect(
		field(page, "disabledCounter").locator(".k-field-counter")
	).toHaveCount(0);
});

test("limits the toolbar to the configured buttons", async ({ page }) => {
	await tab(page, "Buttons");
	await expect(toolbar(page, "limitedButtons")).toMatchAriaSnapshot(`
		- navigation:
		  - button "Bold"
		  - separator
		  - button "Link"
		  - button "Email"
	`);
});

test("supports custom toolbar buttons from plugins", async ({ page }) => {
	await tab(page, "Buttons");

	const input = textbox(page, "customButtons");
	await input.fill("Kirby");
	await input.selectText();
	await button(page, "customButtons", "Highlight").click();
	await expect(input).toHaveValue("<mark>Kirby</mark>");
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await textbox(page, "required").fill("Kirby");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		await textbox(page, "minlength").fill("Kirby");
		await expect(invalid(page, "minlength")).toBeVisible();
		await textbox(page, "minlength").fill("Kirby rocks");
		await expect(invalid(page, "minlength")).toBeHidden();
	});

	test("flags the counter above the maximum length", async ({ page }) => {
		const counter = field(page, "maxlength").locator(".k-counter");
		const input = textbox(page, "maxlength");

		await input.fill("Kirby");
		await expect(counter).toHaveAttribute("data-invalid", "false");

		// unlike text inputs, longer texts are not cut off
		// and only the counter flags them
		await input.pressSequentially(" is awesome");
		await expect(input).toHaveValue("Kirby is awesome");
		await expect(counter).toHaveText("16≤ 10");
		await expect(counter).toHaveAttribute("data-invalid", "true");
		await expect(invalid(page, "maxlength")).toBeHidden();
	});
});

test("grows with the configured size", async ({ page }) => {
	await tab(page, "Sizes");

	let previous = 0;

	for (const name of ["sizeSmall", "sizeMedium", "sizeLarge", "sizeHuge"]) {
		const box = await textbox(page, name).boundingBox();
		expect(box!.height).toBeGreaterThan(previous);
		previous = box!.height;
	}
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
