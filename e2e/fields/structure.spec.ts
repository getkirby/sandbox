import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

/**
 * Adds a new row via the drawer and fills its first text input
 */
const add = async (page: Page, name: string, text?: string) => {
	await field(page, name).getByRole("button", { name: "Add" }).first().click();

	const drawer = page.locator(".k-drawer");
	await expect(drawer).toBeVisible();

	if (text !== undefined) {
		await drawer.getByRole("textbox").first().fill(text);
	}

	await page.keyboard.press("Escape");
	await expect(drawer).toBeHidden();
};

/**
 * Returns the text of all body rows of the given structure field
 */
const rows = (page: Page, name: string) =>
	field(page, name).locator("tbody tr .k-table-column");

const rowOptions = async (page: Page, name: string, index: number) => {
	await field(page, name)
		.locator("tbody tr")
		.nth(index)
		.getByRole("button", { name: "Options" })
		.click();

	return page.locator("dialog[open]").last();
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+structure");
});

test("renders the structure fields", async ({ page }) => {
	await expect(heading(page, "Structure", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-structure").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(
		field(page, "simple").getByRole("button", { name: "No entries yet" })
	).toBeVisible();
	await expect(
		field(page, "empty").getByRole("button", {
			name: "This is some custom empty text"
		})
	).toBeVisible();
});

test("adds rows", async ({ page }) => {
	const label = field(page, "simple").locator(".k-label");

	await expect(label).toHaveAttribute("data-has-diff", "false");
	await add(page, "simple", "First");
	await add(page, "simple", "Second");

	await expect(rows(page, "simple")).toHaveText(["First", "Second"]);
	await expect(label).toHaveAttribute("data-has-diff", "true");
});

test("adds rows from the empty state", async ({ page }) => {
	await field(page, "simple")
		.getByRole("button", { name: "No entries yet" })
		.click();
	await expect(page.locator(".k-drawer")).toBeVisible();
});

test("edits rows", async ({ page }) => {
	await add(page, "simple", "First");

	const options = await rowOptions(page, "simple", 0);
	await expect(options).toMatchAriaSnapshot(`
		- dialog:
		  - button "Edit"
		  - button "Duplicate"
		  - separator
		  - button "Delete"
	`);

	await options.getByRole("button", { name: "Edit" }).click();
	await page.locator(".k-drawer").getByRole("textbox").first().fill("Edited");
	await page.keyboard.press("Escape");

	await expect(rows(page, "simple")).toHaveText(["Edited"]);
});

test("duplicates rows", async ({ page }) => {
	await add(page, "simple", "First");

	const options = await rowOptions(page, "simple", 0);
	await options.getByRole("button", { name: "Duplicate" }).click();

	await expect(rows(page, "simple")).toHaveText(["First", "First"]);
});

test("deletes rows", async ({ page }) => {
	await add(page, "simple", "First");
	await add(page, "simple", "Second");

	const options = await rowOptions(page, "simple", 0);
	await options.getByRole("button", { name: "Delete" }).click();
	await page
		.locator(".k-dialog")
		.getByRole("button", { name: "Delete" })
		.click();

	await expect(rows(page, "simple")).toHaveText(["Second"]);
});

test("deletes all rows", async ({ page }) => {
	await add(page, "simple", "First");
	await add(page, "simple", "Second");

	await field(page, "simple")
		.locator("header")
		.getByRole("button")
		.nth(1)
		.click();
	await page
		.locator("dialog[open]")
		.last()
		.getByRole("button", { name: "Delete all" })
		.click();
	await page
		.locator(".k-dialog")
		.getByRole("button", { name: "Delete" })
		.click();

	await expect(rows(page, "simple")).toHaveCount(0);
	await expect(
		field(page, "simple").getByRole("button", { name: "No entries yet" })
	).toBeVisible();
});

test("disables the field", async ({ page }) => {
	await expect(
		field(page, "disabled").getByRole("button", { name: "Add" })
	).toHaveCount(0);
	await expect(field(page, "disabled")).toContainText("No entries yet");

	await expect(rows(page, "disabledWithValue")).toHaveText(["This is a value"]);
	await expect(
		field(page, "disabledWithValue").getByRole("button", { name: "Options" })
	).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is some test help text"
	);
});

test("supports field names in any case", async ({ page }) => {
	await field(page, "fieldNameCases")
		.getByRole("button", { name: "Add" })
		.first()
		.click();

	const inputs = page.locator(".k-drawer").getByRole("textbox");
	await inputs.nth(0).fill("camel");
	await inputs.nth(1).fill("kebab");
	await inputs.nth(2).fill("snake");
	await page.keyboard.press("Escape");

	await expect(rows(page, "fieldNameCases")).toHaveText([
		"camel",
		"kebab",
		"snake"
	]);
});

test("prefills default values", async ({ page }) => {
	await tab(page, "Defaults");
	await add(page, "fieldWithDefaultValue");
	await add(page, "disabledFieldWithDefaultValue");

	await expect(rows(page, "fieldWithDefaultValue")).toHaveText([
		"Some default text"
	]);
	await expect(rows(page, "disabledFieldWithDefaultValue")).toHaveText([
		"Some default text"
	]);
});

test("sorts rows by the configured field", async ({ changes, page }) => {
	await tab(page, "Sorting");
	await add(page, "sortedByTitle", "Banana");
	await add(page, "sortedByTitle", "Apple");

	// new rows are only sorted when the value is loaded
	await changes.settled();
	await page.reload();

	await expect(
		field(page, "sortedByTitle").locator('tbody [data-column-id="title"]')
	).toHaveText(["Apple", "Banana"]);
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		const invalid = field(page, "required").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await add(page, "required", "First");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum number of rows", async ({ page }) => {
		const invalid = field(page, "min").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await add(page, "min", "First");
		await expect(invalid).toBeHidden();
	});

	test("prevents adding more than the maximum number of rows", async ({
		page
	}) => {
		const button = field(page, "max")
			.getByRole("button", { name: "Add" })
			.first();

		await add(page, "max", "First");
		await expect(button).toBeDisabled();
	});

	test("validates the min/max range", async ({ page }) => {
		const invalid = field(page, "minmax").locator(".k-label-invalid");
		const button = field(page, "minmax")
			.getByRole("button", { name: "Add" })
			.first();

		await expect(invalid).toBeVisible();
		await add(page, "minmax", "First");
		await expect(invalid).toBeHidden();
		await add(page, "minmax", "Second");
		await expect(button).toBeDisabled();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
