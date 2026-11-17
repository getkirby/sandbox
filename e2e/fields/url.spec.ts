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
	await page.goto("/panel/pages/fields+url");
});

test("renders the url fields", async ({ page }) => {
	await expect(heading(page, "URL", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-url").first()).toBeVisible();
});

test("uses a url input with defaults", async ({ page }) => {
	const input = textbox(page, "url");

	await expect(input).toHaveAttribute("type", "url");
	await expect(input).toHaveAttribute("autocomplete", "url");
	await expect(input).toHaveAttribute("placeholder", "https://example.com");
	await expect(
		field(page, "url").locator('.k-input-icon [data-type="url"]')
	).toBeVisible();
});

test("validates URLs", async ({ page }) => {
	const invalid = field(page, "url").locator(".k-label-invalid");

	await textbox(page, "url").fill("getkirby");
	await expect(invalid).toBeVisible();

	await textbox(page, "url").fill("https://getkirby.com");
	await expect(invalid).toBeHidden();
	await expect(field(page, "url").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
});

test("links to the URL", async ({ page }) => {
	await textbox(page, "url").fill("https://getkirby.com");

	const link = field(page, "url").getByRole("link", { name: "Open" });
	await expect(link).toHaveAttribute("href", "https://getkirby.com");
	await expect(link).toHaveAttribute("target", "_blank");
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
		"https://getkirby.com"
	);
	await expect(
		field(page, "disabledWithValue").getByRole("link", { name: "Open" })
	).toHaveAttribute("href", "https://getkirby.com");
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
		await textbox(page, "required").fill("https://getkirby.com");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		const invalid = field(page, "minlength").locator(".k-label-invalid");

		await textbox(page, "minlength").fill("https://k");
		await expect(invalid).toBeVisible();
		await textbox(page, "minlength").fill("https://getkirby.com");
		await expect(invalid).toBeHidden();
	});

	test("limits the maximum length", async ({ page }) => {
		await textbox(page, "maxlength").pressSequentially("https://getkirby.com");
		await expect(textbox(page, "maxlength")).toHaveValue("https://ge");
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
