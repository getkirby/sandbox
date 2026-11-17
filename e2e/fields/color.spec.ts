import type { Page } from "@playwright/test";
import {
	dropdown,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test,
	textbox
} from "../fixtures.ts";

const enter = async (page: Page, name: string, value: string) => {
	await textbox(page, name).fill(value);
	await textbox(page, name).press("Tab");
};

const picker = async (page: Page, name: string) => {
	await field(page, name).locator(".k-color-field-picker-toggle").click();
	return dropdown(page);
};

const swatch = (page: Page, name: string) =>
	field(page, name).locator(".k-color-field-picker-toggle .k-color-frame");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+color");
});

test("renders the color fields", async ({ page }) => {
	await expect(heading(page, "Color", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-color").first()).toBeVisible();
});

test("stores typed colors and previews them", async ({ changes, page }) => {
	await enter(page, "color", "#ff0000");

	await expect(swatch(page, "color")).toHaveAttribute(
		"style",
		/--color-frame-back: #ff0000/
	);
	await expect(field(page, "color").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).color).toBe("#ff0000");
});

test("opens the color picker", async ({ page }) => {
	const dropdown = await picker(page, "color");
	await expect(dropdown.getByRole("slider", { name: "Hue" })).toBeVisible();
	await expect(dropdown.getByRole("slider", { name: "Alpha" })).toHaveCount(0);
});

test("offers an alpha slider", async ({ page }) => {
	const dropdown = await picker(page, "alpha");
	await expect(dropdown.getByRole("slider", { name: "Alpha" })).toBeVisible();
});

test("converts CSS color names", async ({ changes, page }) => {
	await enter(page, "color", "rebeccapurple");

	await expect(textbox(page, "color")).toHaveValue("#663399");
	expect((await changes.saved()).color).toBe("#663399");
});

test("falls back to black for unknown colors", async ({ changes, page }) => {
	// invalid input is converted via `getComputedStyle()`,
	// which returns black for anything it can't read
	await enter(page, "color", "notacolor");

	await expect(textbox(page, "color")).toHaveValue("#000000");
	await expect(invalid(page, "color")).toBeHidden();
	expect((await changes.saved()).color).toBe("#000000");
});

test("validates required fields", async ({ page }) => {
	await expect(invalid(page, "required")).toBeVisible();
	await enter(page, "required", "#336699");
	await expect(invalid(page, "required")).toBeHidden();
});

test("shows placeholder and help", async ({ page }) => {
	await expect(textbox(page, "placeholder")).toHaveAttribute(
		"placeholder",
		"Pick a color …"
	);
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("disables the field", async ({ page }) => {
	await expect(textbox(page, "disabled")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toHaveValue("#ff00ff");
	await expect(swatch(page, "disabledWithValue")).toHaveAttribute(
		"style",
		/--color-frame-back: #ff00ff/
	);
});

test.describe("formats", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Formats");
	});

	test("converts colors to the configured format", async ({
		changes,
		page
	}) => {
		await enter(page, "hexFormat", "rgb(255 0 0)");
		await enter(page, "rgbFormat", "#ff0000");
		await enter(page, "hslFormat", "#ff0000");

		await expect(textbox(page, "rgbFormat")).toHaveValue("rgb(255 0 0)");
		await expect(textbox(page, "hslFormat")).toHaveValue("hsl(0 100% 50%)");

		const saved = await changes.saved();
		expect(saved.hexformat).toBe("#ff0000");
		expect(saved.rgbformat).toBe("rgb(255 0 0)");
		expect(saved.hslformat).toBe("hsl(0 100% 50%)");
	});
});

test.describe("options", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Options");
	});

	test("picks colors from the options", async ({ changes, page }) => {
		const dropdown = await picker(page, "optionsFromKeysAndValues");
		const options = dropdown.locator(".k-coloroptions-input input");

		await expect(options).toHaveCount(5);
		await options.nth(2).check({ force: true });

		// option values are normalized to lowercase
		await expect(textbox(page, "optionsFromKeysAndValues")).toHaveValue(
			"#c06c84"
		);
		expect((await changes.saved()).optionsfromkeysandvalues).toBe("#c06c84");
	});

	test("loads options from an API and a query", async ({ page }) => {
		for (const name of ["optionsFromApi", "optionsFromQuery"]) {
			const dropdown = await picker(page, name);
			await expect(
				dropdown.locator(".k-coloroptions-input input").first()
			).toBeAttached();
			await page.keyboard.press("Escape");
		}
	});
});

test.describe("options mode", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Options Mode");
	});

	test("shows the options inline", async ({ changes, page }) => {
		const options = field(page, "optionsMode").locator('input[type="radio"]');

		await expect(options).toHaveCount(5);
		await expect(field(page, "optionsMode").getByRole("textbox")).toHaveCount(
			0
		);

		await options.nth(0).check({ force: true });
		expect((await changes.saved()).optionsmode).toBe("#f8b195");

		// the stored value is still recognized after reloading
		await page.reload();
		await expect(options.nth(0)).toBeChecked();
	});

	test("disables the options", async ({ page }) => {
		const options = field(page, "optionsModeDisabled").locator(
			'input[type="radio"]'
		);

		await expect(options).toHaveCount(5);

		for (const option of await options.all()) {
			await expect(option).toBeDisabled();
		}
	});
});

test("hides the picker in input mode", async ({ changes, page }) => {
	await tab(page, "Input Mode");

	await expect(textbox(page, "input")).toBeVisible();
	await expect(
		field(page, "input").locator(".k-color-field-picker-toggle")
	).toHaveCount(0);

	await enter(page, "input", "#123456");
	expect((await changes.saved()).input).toBe("#123456");
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
