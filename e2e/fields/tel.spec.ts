import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test,
	textbox
} from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+tel");
});

test("renders the tel fields", async ({ page }) => {
	await expect(heading(page, "Tel", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-tel").first()).toBeVisible();
});

test("uses a tel input with defaults", async ({ page }) => {
	const input = textbox(page, "tel");

	await expect(input).toHaveAttribute("type", "tel");
	await expect(input).toHaveAttribute("autocomplete", "tel");
	await expect(input).toHaveAttribute("placeholder", "+49123456789");
	await expect(
		field(page, "tel").locator('.k-input-icon [data-type="phone"]')
	).toBeVisible();
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Call me …"
	);
});

test("stores the phone number", async ({ page }) => {
	await textbox(page, "tel").fill("+49123456789");
	await expect(textbox(page, "tel")).toHaveValue("+49123456789");
	await expect(field(page, "tel").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
});

test("shows before and after texts", async ({ page }) => {
	await expect(field(page, "before").locator(".k-input-before")).toHaveText(
		"Before"
	);
	await expect(field(page, "after").locator(".k-input-after")).toHaveText(
		"After"
	);
	await expect(field(page, "after").locator(".k-input-before")).toHaveCount(0);

	const all = field(page, "beforeAndAfterAndIcon");
	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("disables the input", async ({ page }) => {
	await expect(textbox(page, "disabled")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toHaveValue("+49123456789");
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
		const invalid = field(page, "required").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await textbox(page, "required").fill("+49123456789");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		const invalid = field(page, "minlength").locator(".k-label-invalid");

		await textbox(page, "minlength").fill("+49123");
		await expect(invalid).toBeVisible();
		await textbox(page, "minlength").fill("+49123456789");
		await expect(invalid).toBeHidden();
	});

	test("limits the maximum length", async ({ page }) => {
		await textbox(page, "maxlength").pressSequentially("+49123456789");
		await expect(textbox(page, "maxlength")).toHaveValue("+491234567");
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
