import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const dropdown = (page: Page) => page.locator("dialog[open]").last();

const open = async (page: Page, name: string) => {
	await field(page, name).locator(".k-multiselect-input-toggle").click();
	await expect(dropdown(page)).toBeVisible();
	return dropdown(page);
};

const options = (page: Page) => dropdown(page).locator(".k-choice-input-label");

const pick = async (page: Page, name: string, ...values: string[]) => {
	await open(page, name);

	for (const value of values) {
		await options(page)
			.filter({ hasText: new RegExp(`^${value}$`) })
			.click();
	}

	await page.keyboard.press("Escape");
};

const tags = (page: Page, name: string) =>
	field(page, name).locator(".k-tag-text");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+multiselect");
});

test("renders the multiselect fields", async ({ page }) => {
	await expect(heading(page, "Multiselect", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-multiselect").first()).toBeVisible();
});

test("selects multiple options", async ({ changes, page }) => {
	await pick(page, "simple", "b", "a");

	await expect(tags(page, "simple")).toHaveText(["b", "a"]);
	await expect(field(page, "simple").locator(".k-field-counter")).toHaveText(
		"2"
	);
	expect((await changes.saved()).simple).toEqual(["b", "a"]);
});

test("keeps the dropdown open for multiple selections", async ({ page }) => {
	await open(page, "simple");
	await options(page).filter({ hasText: /^a$/ }).click();

	await expect(dropdown(page)).toBeVisible();
	await expect(dropdown(page).locator('input[value="a"]')).toBeChecked();
});

test("deselects options", async ({ changes, page }) => {
	await pick(page, "simple", "a", "b");
	await pick(page, "simple", "a");

	await expect(tags(page, "simple")).toHaveText(["b"]);
	expect((await changes.saved()).simple).toEqual(["b"]);
});

test("filters the options", async ({ page }) => {
	const list = await open(page, "simple");

	await expect(list.getByRole("searchbox")).toHaveAttribute(
		"placeholder",
		"Filter…"
	);
	await list.getByRole("searchbox").fill("c");
	await expect(options(page)).toHaveText(["c"]);
});

test("does not create custom options", async ({ page }) => {
	const list = await open(page, "simple");

	await list.getByRole("searchbox").fill("zebra");
	await page.keyboard.press("Enter");

	await expect(options(page)).toHaveCount(0);
	await expect(tags(page, "simple")).toHaveCount(0);
});

test("disables the field", async ({ page }) => {
	await expect(tags(page, "disabledWithValue")).toHaveText(["a", "b"]);
	await expect(
		field(page, "disabledWithValue").locator(".k-tag-toggle")
	).toHaveCount(0);
	await expect(
		field(page, "disabled").locator(".k-multiselect-input-toggle")
	).toBeDisabled();
});

test("shows the icon and help", async ({ page }) => {
	await expect(
		field(page, "icon").locator('.k-input-icon [data-type="heart"]')
	).toBeVisible();
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is a short help text."
	);
});

test.describe("options", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Options");
	});

	test("resolves option labels", async ({ page }) => {
		await pick(page, "optionsFromObjects", "Option C");
		await expect(tags(page, "optionsFromObjects")).toHaveText(["Option C"]);
	});

	test("searches option infos", async ({ page }) => {
		let list = await open(page, "optionsWithInfo");
		await list.getByRole("searchbox").fill("second");
		await expect(options(page)).toHaveCount(0);
		await page.keyboard.press("Escape");
		await page.keyboard.press("Escape");

		list = await open(page, "optionsWithInfoAndSearchableInfo");
		await list.getByRole("searchbox").fill("second");
		await expect(options(page)).toHaveCount(1);
		await expect(options(page)).toContainText("Option B");
	});

	test("offers no custom options even when accepted", async ({ page }) => {
		// `accept: all` only relaxes the backend validation,
		// the multiselect input has no UI to create options
		const list = await open(page, "optionsAcceptAll");

		await list.getByRole("searchbox").fill("zebra");
		await page.keyboard.press("Enter");

		await expect(options(page)).toHaveCount(0);
		await expect(tags(page, "optionsAcceptAll")).toHaveCount(0);
	});

	test("sorts selections by the option order", async ({ page }) => {
		await pick(page, "optionsAcceptAll", "c", "a");
		await expect(tags(page, "optionsAcceptAll")).toHaveText(["a", "c"]);
	});
});

test.describe("search", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Search");
	});

	test("hides the search", async ({ page }) => {
		const list = await open(page, "searchFalse");
		await expect(list.getByRole("searchbox")).toHaveCount(0);
		await expect(options(page)).toHaveCount(3);
	});

	test("limits the displayed options", async ({ page }) => {
		await open(page, "searchDisplayOnly2");
		await expect(options(page)).toHaveCount(2);
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		const invalid = field(page, "required").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await pick(page, "required", "a");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum number of options", async ({ page }) => {
		const invalid = field(page, "min").locator(".k-label-invalid");

		await pick(page, "min", "a");
		await expect(invalid).toBeVisible();
		await pick(page, "min", "b");
		await expect(invalid).toBeHidden();
	});

	test("prevents selecting more than the maximum", async ({ page }) => {
		await open(page, "max");
		await options(page).filter({ hasText: /^a$/ }).click();
		await options(page).filter({ hasText: /^b$/ }).click();

		await expect(dropdown(page).locator('input[value="c"]')).toBeDisabled();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
