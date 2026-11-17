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
	await page.goto("/panel/pages/fields+slug");
});

test("renders the slug fields", async ({ page }) => {
	await expect(heading(page, "Slug", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-slug").first()).toBeVisible();
});

test("converts input to a slug while typing", async ({ changes, page }) => {
	await textbox(page, "slug").pressSequentially("Hello World 2026");

	await expect(textbox(page, "slug")).toHaveValue("hello-world-2026");
	await expect(field(page, "slug").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).slug).toBe("hello-world-2026");
});

test("collapses separators", async ({ page }) => {
	await textbox(page, "slug").pressSequentially("Kirby & Panel");
	await expect(textbox(page, "slug")).toHaveValue("kirby-panel");
});

test("transliterates special characters", async ({ page }) => {
	// Known bug: `RegExp.escape()` now escapes `|`, which breaks the
	// alternations in the ascii rules (e.g. `ò|ó|…|ö`), so special
	// characters are replaced with separators. Remove this line once fixed.
	test.fail();

	await textbox(page, "slug").pressSequentially("Wörld");
	await expect(textbox(page, "slug")).toHaveValue("world", { timeout: 1000 });
});

test("does not store trailing special characters", async ({
	changes,
	page
}) => {
	// Known bug: when a new character doesn't change the slug
	// (e.g. a trailing `!`), the raw input is stored as value.
	// Remove this line once fixed.
	test.fail();

	await textbox(page, "slug").pressSequentially("Hello!");
	expect((await changes.saved()).slug).toBe("hello");
});

test("shows placeholder, icon, before and after texts", async ({ page }) => {
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Write something …"
	);

	const all = field(page, "beforeAndAfterAndIcon");
	await expect(all.locator(".k-input-before")).toHaveText("Before");
	await expect(all.locator(".k-input-after")).toHaveText("After");
	await expect(all.locator('.k-input-icon [data-type="edit"]')).toBeVisible();
});

test("disables the input", async ({ page }) => {
	await expect(textbox(page, "disabled")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toHaveValue(
		"this-is-a-slug"
	);
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
		await textbox(page, "required").pressSequentially("kirby");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		await textbox(page, "minlength").pressSequentially("kirby");
		await expect(invalid(page, "minlength")).toBeVisible();
		await textbox(page, "minlength").pressSequentially("-rocks");
		await expect(invalid(page, "minlength")).toBeHidden();
	});

	test("limits the maximum length", async ({ page }) => {
		await textbox(page, "maxlength").pressSequentially("kirby-is-awesome");
		await expect(textbox(page, "maxlength")).toHaveValue("kirby-is-a");
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
