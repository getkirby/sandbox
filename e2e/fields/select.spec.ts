import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

const options = (page: Page, name: string) =>
	select(page, name).locator("option");

const select = (page: Page, name: string) =>
	field(page, name).getByRole("combobox");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+select");
});

test("renders the select fields", async ({ page }) => {
	await expect(heading(page, "Select", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-select").first()).toBeVisible();
});

test("selects an option", async ({ page }) => {
	const label = field(page, "simple").locator(".k-label");

	await expect(options(page, "simple")).toHaveText(["—", "a", "b", "c"]);
	await expect(select(page, "simple")).toHaveValue("");

	await select(page, "simple").selectOption("b");
	await expect(select(page, "simple")).toHaveValue("b");
	await expect(field(page, "simple").locator(".k-select-input")).toContainText(
		"b"
	);
	await expect(label).toHaveAttribute("data-has-diff", "true");
});

test("resets the selection", async ({ page }) => {
	await select(page, "simple").selectOption("b");
	await select(page, "simple").selectOption("");
	await expect(select(page, "simple")).toHaveValue("");
});

test("shows the placeholder as empty option", async ({ page }) => {
	await expect(options(page, "placeholder").first()).toHaveText("Placeholder");
	await expect(
		field(page, "placeholder").locator(".k-select-input")
	).toContainText("Placeholder");
});

test("shows the icon", async ({ page }) => {
	await expect(
		field(page, "icon").locator('.k-input-icon [data-type="heart"]')
	).toBeVisible();
});

test("disables the select", async ({ page }) => {
	await expect(select(page, "disabled")).toBeDisabled();
	await expect(select(page, "disabledWithValue")).toBeDisabled();
	await expect(select(page, "disabledWithValue")).toHaveValue("a");
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is a short help text."
	);
});

test.describe("options", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Options");
	});

	test("resolves option labels from all formats", async ({ page }) => {
		for (const name of [
			"optionsFromKeysAndValues",
			"optionsFromObjects",
			"optionsWithTranslatedLabel",
			"optionsWithTranslatedLabelI18nKey"
		]) {
			await expect(options(page, name)).toHaveText([
				"—",
				"Option A",
				"Option B",
				"Option C"
			]);
		}

		await select(page, "optionsFromObjects").selectOption("Option B");
		await expect(select(page, "optionsFromObjects")).toHaveValue("b");
	});

	test("loads options from an API", async ({ page }) => {
		await expect(options(page, "optionsFromApi")).toHaveText([
			"—",
			"Apple",
			"Microsoft",
			"Kirby",
			`<img src="x" onerror="alert('xss')">`
		]);

		await select(page, "optionsFromApi").selectOption("Kirby");
		await expect(select(page, "optionsFromApi")).toHaveValue("KBY");
	});

	test("loads options from a query", async ({ page }) => {
		await expect(options(page, "optionsFromQuery")).toHaveText([
			"—",
			"Benchmarks",
			"Error",
			"Fields"
		]);
	});

	test("escapes HTML in option labels", async ({ page }) => {
		await expect(options(page, "optionsWithHtmlEscaped")).toHaveText([
			"—",
			"A<b>ppl</b>e",
			"Micro<b>soft</b>",
			"<b>K</b>irby"
		]);
	});
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await select(page, "required").selectOption("a");
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
