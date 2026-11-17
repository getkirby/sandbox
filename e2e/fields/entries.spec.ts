import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const items = (page: Page, name: string) =>
	field(page, name).locator(".k-entries-field-item");

const inputs = (page: Page, name: string) =>
	items(page, name).locator(".k-entries-field-item-input input");

const option = (page: Page, name: string, index: number, label: string) =>
	items(page, name)
		.nth(index)
		.locator(".k-entries-field-item-options")
		.getByRole("button", { exact: true, name: label });

const add = async (page: Page, name: string) => {
	await field(page, name)
		.locator("header")
		.getByRole("button", { name: "Add" })
		.click();
};

/**
 * Adds a new entry for each value
 */
const fill = async (page: Page, name: string, ...values: string[]) => {
	for (const value of values) {
		await add(page, name);
		await inputs(page, name).last().fill(value);
	}
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+entries");
});

test("renders the entries fields", async ({ page }) => {
	await expect(heading(page, "Entries", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-entries").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(field(page, "entries").locator(".k-empty")).toHaveText(
		"No entries yet"
	);
});

test("adds entries", async ({ changes, page }) => {
	await fill(page, "entries", "One", "Two");

	await expect(inputs(page, "entries")).toHaveCount(2);
	await expect(field(page, "entries").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);
	expect((await changes.saved()).entries).toEqual(["One", "Two"]);
});

test("focuses new entries", async ({ page }) => {
	await add(page, "entries");
	await expect(inputs(page, "entries").first()).toBeFocused();
});

test("inserts entries after the current one", async ({ changes, page }) => {
	await fill(page, "entries", "One", "Three");

	await option(page, "entries", 0, "Add").click();
	await inputs(page, "entries").nth(1).fill("Two");

	expect((await changes.saved()).entries).toEqual(["One", "Two", "Three"]);
});

test("duplicates entries", async ({ changes, page }) => {
	await fill(page, "entries", "One");
	await option(page, "entries", 0, "Duplicate").click();

	await expect(inputs(page, "entries")).toHaveCount(2);
	expect((await changes.saved()).entries).toEqual(["One", "One"]);
});

test("removes entries", async ({ changes, page }) => {
	await fill(page, "entries", "One", "Two");
	await option(page, "entries", 0, "Remove").click();

	await expect(inputs(page, "entries")).toHaveCount(1);
	expect((await changes.saved()).entries).toEqual(["Two"]);
});

test("sorts entries with the keyboard", async ({ changes, page }) => {
	await fill(page, "entries", "One", "Two");

	await items(page, "entries")
		.nth(1)
		.locator(".k-entries-field-item-sort-handle")
		.press("ArrowUp");

	expect((await changes.saved()).entries).toEqual(["Two", "One"]);
});

test("deletes all entries", async ({ page }) => {
	await fill(page, "entries", "One", "Two");

	await field(page, "entries")
		.locator("header")
		.getByRole("button")
		.nth(1)
		.click();

	const menu = page.locator("dialog[open]").last();
	await expect(menu).toMatchAriaSnapshot(`
		- dialog:
		  - button "Copy all"
		  - separator
		  - button "Delete all"
	`);

	await menu.getByRole("button", { name: "Delete all" }).click();
	await page
		.locator(".k-dialog")
		.getByRole("button", { name: "Delete" })
		.click();

	await expect(field(page, "entries").locator(".k-empty")).toBeVisible();
});

test("disables the field", async ({ page }) => {
	await expect(inputs(page, "disabledWithValue")).toHaveCount(2);

	for (const [index, value] of ["One entry", "Two entries"].entries()) {
		await expect(inputs(page, "disabledWithValue").nth(index)).toHaveValue(
			value
		);
		await expect(inputs(page, "disabledWithValue").nth(index)).toBeDisabled();
	}

	await expect(
		field(page, "disabledWithValue").getByRole("button", { name: "Add" })
	).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("prefills new entries with the default value", async ({ page }) => {
	// Known bug: the entry field's `default` is no longer exported
	// to the Panel, so new entries start empty. Remove this line once fixed.
	test.fail();

	await tab(page, "Defaults");
	await add(page, "fieldWithDefaultValue");

	await expect(inputs(page, "fieldWithDefaultValue").first()).toHaveValue(
		"Some default text",
		{ timeout: 1000 }
	);
});

test.describe("types", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Types");
	});

	test("uses the configured field type", async ({ page }) => {
		for (const [name, type] of [
			["email", "email"],
			["number", "number"],
			["tel", "tel"],
			["url", "url"]
		]) {
			await add(page, name);
			await expect(inputs(page, name).first()).toHaveAttribute("type", type);
		}
	});

	test("supports select entries", async ({ changes, page }) => {
		await add(page, "select");

		const select = items(page, "select").first().getByRole("combobox");
		await expect(select.locator("option")).toHaveText(["—", "a", "b", "c"]);
		await select.selectOption("b");

		expect((await changes.saved()).select).toEqual(["b"]);
	});

	test("supports date entries", async ({ changes, page }) => {
		await add(page, "date");

		await inputs(page, "date").first().fill("2021-03-05");
		await inputs(page, "date").first().press("Tab");

		expect((await changes.saved()).date).toEqual(["2021-03-05 00:00:00"]);
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		const invalid = field(page, "required").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await fill(page, "required", "One");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum number of entries", async ({ page }) => {
		const invalid = field(page, "min").locator(".k-label-invalid");

		await fill(page, "min", "One", "Two");
		await expect(invalid).toBeVisible();
		await fill(page, "min", "Three");
		await expect(invalid).toBeHidden();
	});

	test("prevents adding more than the maximum", async ({ page }) => {
		await fill(page, "max", "1", "2", "3", "4", "5");

		await expect(inputs(page, "max")).toHaveCount(5);
		await expect(
			field(page, "max").getByRole("button", { exact: true, name: "Add" })
		).toHaveCount(0);
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
