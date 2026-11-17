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
	await page.goto("/panel/pages/fields+text");
});

test("renders the text fields", async ({ page }) => {
	await expect(heading(page, "Text", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-text").first()).toBeVisible();
});

test("marks the field as changed when typing", async ({ page }) => {
	const input = textbox(page, "text");
	const label = field(page, "text").locator(".k-label");

	await expect(label).toHaveAttribute("data-has-diff", "false");
	await input.fill("Hello world");
	await expect(input).toHaveValue("Hello world");
	await expect(label).toHaveAttribute("data-has-diff", "true");
	await expect(
		page.getByRole("button", { name: "Discard" }).first()
	).toBeVisible();
});

test("shows the placeholder", async ({ page }) => {
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Write something …"
	);
});

test("shows icons, before and after texts", async ({ page }) => {
	await expect(field(page, "icon").locator(".k-input-icon")).toBeVisible();

	const before = field(page, "before");
	await expect(before.locator(".k-input-before")).toHaveText("Before");
	await expect(before.locator(".k-input-after")).toHaveCount(0);

	const after = field(page, "after");
	await expect(after.locator(".k-input-after")).toHaveText("After");
	await expect(after.locator(".k-input-before")).toHaveCount(0);

	const all = field(page, "beforeAndAfterAndIcon");
	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("disables inputs", async ({ page }) => {
	await expect(textbox(page, "disabled")).toBeDisabled();

	const value = textbox(page, "disabledWithValue");
	await expect(value).toBeDisabled();
	await expect(value).toHaveValue("This is a value");

	const placeholder = textbox(page, "disabledWithPlaceholder");
	await expect(placeholder).toBeDisabled();
	await expect(placeholder).toHaveAttribute(
		"placeholder",
		"Disabled with placeholder"
	);
});

test("shows the counter while focused", async ({ page }) => {
	const counter = field(page, "text").locator(".k-field-counter");

	// no counter for empty fields
	await expect(counter).toHaveCount(0);

	await textbox(page, "text").fill("Kirby");
	await expect(counter).toBeVisible();
	await expect(counter).toHaveText("5");

	// the counter is only visible while the field is focused
	await textbox(page, "placeholder").focus();
	await expect(counter).toBeHidden();
});

test("hides the counter when disabled", async ({ page }) => {
	await textbox(page, "disabledCounter").fill("Kirby");
	await expect(
		field(page, "disabledCounter").locator(".k-field-counter")
	).toHaveCount(0);
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
		const required = field(page, "required");

		await expect(required.getByTitle("The field is required")).toBeAttached();
		await expect(invalid(page, "required")).toBeVisible();

		await textbox(page, "required").fill("Kirby");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		const minlength = field(page, "minlength");
		const input = textbox(page, "minlength");

		// empty optional fields are valid
		await expect(invalid(page, "minlength")).toBeHidden();

		await input.fill("Kirby");
		await expect(invalid(page, "minlength")).toBeVisible();
		await expect(minlength.locator(".k-counter")).toHaveText("5≥ 10");
		await expect(minlength.locator(".k-counter")).toHaveAttribute(
			"data-invalid",
			"true"
		);

		await input.fill("Kirby rocks");
		await expect(invalid(page, "minlength")).toBeHidden();
	});

	test("limits the maximum length", async ({ page }) => {
		const maxlength = field(page, "maxlength");
		const input = textbox(page, "maxlength");

		await input.pressSequentially("Kirby is awesome");
		await expect(input).toHaveValue("Kirby is a");
		await expect(maxlength.locator(".k-counter")).toHaveText("10≤ 10");
		await expect(invalid(page, "maxlength")).toBeHidden();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
