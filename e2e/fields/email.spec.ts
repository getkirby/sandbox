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

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+email");
});

test("renders the email fields", async ({ page }) => {
	await expect(heading(page, "Email", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-email").first()).toBeVisible();
});

test("uses an email input with defaults", async ({ page }) => {
	const input = textbox(page, "email");

	await expect(input).toHaveAttribute("type", "email");
	await expect(input).toHaveAttribute("autocomplete", "email");
	await expect(input).toHaveAttribute("placeholder", "mail@example.com");
	await expect(
		field(page, "email").locator('.k-input-icon [data-type="email"]')
	).toBeVisible();
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Contact me …"
	);
});

test("validates email addresses", async ({ page }) => {
	await textbox(page, "email").fill("homer");
	await expect(invalid(page, "email")).toBeVisible();

	await textbox(page, "email").fill("homer@simpson.com");
	await expect(invalid(page, "email")).toBeHidden();
	await expect(field(page, "email").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
});

test("links to the email address", async ({ page }) => {
	await textbox(page, "email").fill("homer@simpson.com");
	await expect(
		field(page, "email").getByRole("link", { name: "Open" })
	).toHaveAttribute("href", "mailto:homer@simpson.com");
});

test("shows before and after texts", async ({ page }) => {
	const all = field(page, "beforeAndAfterAndIcon");
	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("disables the input", async ({ page }) => {
	await expect(textbox(page, "disabled")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toHaveValue(
		"homer@simpson.com"
	);
	await expect(
		field(page, "disabledWithValue").getByRole("link", { name: "Open" })
	).toHaveAttribute("href", "mailto:homer@simpson.com");
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await textbox(page, "required").fill("homer@simpson.com");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		await textbox(page, "minlength").fill("a@b.de");
		await expect(invalid(page, "minlength")).toBeVisible();
		await textbox(page, "minlength").fill("homer@simpson.com");
		await expect(invalid(page, "minlength")).toBeHidden();
	});

	test("limits the maximum length", async ({ page }) => {
		await textbox(page, "maxlength").pressSequentially("homer@simpson.com");
		await expect(textbox(page, "maxlength")).toHaveValue("homer@simp");
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
