import type { Page } from "@playwright/test";
import {
	dialog,
	dropdown,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

/**
 * Opens the block selector of the field and
 * picks the given fieldset, if a selector appears
 */
const add = async (page: Page, name: string, fieldset?: string) => {
	await field(page, name).getByRole("button", { name: "Add" }).first().click();

	if (fieldset !== undefined) {
		await dialog(page)
			.getByRole("button", { exact: true, name: fieldset })
			.click();
	}
};

const blocks = (page: Page, name: string) =>
	field(page, name).locator(".k-block-container");

const more = async (page: Page, name: string, index: number) => {
	await blocks(page, name).nth(index).click();
	await options(page, name, index)
		.getByRole("button", { name: "More" })
		.click();
	return dropdown(page);
};

const options = (page: Page, name: string, index: number) =>
	blocks(page, name).nth(index).locator(".k-block-options");

/**
 * Types into the focused writer of the last added block
 */
const write = async (page: Page, name: string, text: string) => {
	await expect(blocks(page, name).last().locator(".ProseMirror")).toBeFocused();
	await page.keyboard.type(text);
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+blocks");
});

test("renders the blocks fields", async ({ page }) => {
	await expect(heading(page, "Blocks", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-blocks").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(
		field(page, "blocks").getByRole("button", { name: "No blocks yet" })
	).toBeVisible();
	await expect(
		field(page, "empty").getByRole("button", {
			name: "This is some custom empty text"
		})
	).toBeVisible();
});

test("lists the default block types", async ({ page }) => {
	await add(page, "blocks");

	await expect(dialog(page)).toMatchAriaSnapshot(`
		- group:
		  - text: Please select a block type …
		  - button "Code"
		  - button "Gallery"
		  - button "Heading"
		  - button "Image"
		  - button "Line"
		  - button "List"
		  - button "Markdown"
		  - button "Quote"
		  - button "Text"
		  - button "Video"
	`);
});

test("adds and edits blocks", async ({ page }) => {
	const label = field(page, "blocks").locator(".k-label");

	await expect(label).toHaveAttribute("data-has-diff", "false");
	await add(page, "blocks", "Text");
	await write(page, "blocks", "Hello blocks");

	await expect(blocks(page, "blocks")).toHaveCount(1);
	await expect(blocks(page, "blocks").first()).toHaveAttribute(
		"data-selected",
		"true"
	);
	await expect(
		blocks(page, "blocks").first().locator("textarea.input-hidden")
	).toHaveValue("<p>Hello blocks</p>");
	await expect(label).toHaveAttribute("data-has-diff", "true");
});

test("shows the block options", async ({ page }) => {
	await add(page, "blocks", "Text");

	await expect(options(page, "blocks", 0)).toMatchAriaSnapshot(`
		- navigation:
		  - button "Edit"
		  - button "Insert after"
		  - button "Delete"
		  - button "Drag to sort …"
		  - button "More"
	`);
});

test("inserts blocks after the current one", async ({ page }) => {
	await add(page, "blocks", "Text");
	await write(page, "blocks", "First");

	await options(page, "blocks", 0)
		.getByRole("button", { name: "Insert after" })
		.click();
	await dialog(page)
		.getByRole("button", { exact: true, name: "Heading" })
		.click();

	await expect(blocks(page, "blocks")).toHaveCount(2);
	await expect(blocks(page, "blocks").nth(1)).toHaveClass(
		/k-block-container-type-heading/
	);
});

test("duplicates blocks", async ({ page }) => {
	await add(page, "blocks", "Text");
	await write(page, "blocks", "First");

	const menu = await more(page, "blocks", 0);
	await menu.getByRole("button", { name: "Duplicate" }).click();

	await expect(blocks(page, "blocks")).toHaveCount(2);
	await expect(blocks(page, "blocks").nth(1)).toContainText("First");
});

test("hides and shows blocks", async ({ page }) => {
	await add(page, "blocks", "Text");

	let menu = await more(page, "blocks", 0);
	await menu.getByRole("button", { name: "Hide" }).click();
	await expect(blocks(page, "blocks").first()).toHaveAttribute(
		"data-hidden",
		"true"
	);

	menu = await more(page, "blocks", 0);
	await menu.getByRole("button", { name: "Show" }).click();
	await expect(blocks(page, "blocks").first()).toHaveAttribute(
		"data-hidden",
		"false"
	);
});

test("deletes blocks", async ({ page }) => {
	await add(page, "blocks", "Text");

	await options(page, "blocks", 0)
		.getByRole("button", { name: "Delete" })
		.click();
	await dialog(page).getByRole("button", { name: "Delete" }).click();

	await expect(blocks(page, "blocks")).toHaveCount(0);
	await expect(
		field(page, "blocks").getByRole("button", { name: "No blocks yet" })
	).toBeVisible();
});

test("disables the field", async ({ page }) => {
	await expect(field(page, "disabled")).toContainText("No blocks yet");
	await expect(
		field(page, "disabled").getByRole("button", { name: "Add" })
	).toHaveCount(0);

	await expect(blocks(page, "disabledWithValue")).toHaveText([
		"This is a value"
	]);
	await expect(blocks(page, "disabledWithValue").first()).toHaveAttribute(
		"data-disabled",
		"true"
	);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is some help text"
	);
});

test("adds the only allowed block type without selector", async ({ page }) => {
	await add(page, "tabs");

	await expect(dialog(page)).toHaveCount(0);
	await expect(blocks(page, "tabs").first()).toHaveClass(
		/k-block-container-fieldset-tabs/
	);
});

test("shows wysiwyg field previews", async ({ page }) => {
	await add(page, "fields");

	const block = blocks(page, "fields").first();
	await expect(block.locator(".k-field-name-title")).toBeVisible();
	await expect(block.locator(".k-field-name-text")).toBeVisible();

	await block.locator(".k-field-name-title").getByRole("textbox").fill("Title");
	await expect(
		block.locator(".k-field-name-title").getByRole("textbox")
	).toHaveValue("Title");
});

test("prefills default values", async ({ page }) => {
	await tab(page, "Defaults");
	await add(page, "fieldWithDefaultValue");
	await add(page, "disabledFieldWithDefaultValue");

	await expect(
		blocks(page, "fieldWithDefaultValue").first().getByRole("textbox")
	).toHaveValue("Some default text");

	const disabled = blocks(page, "disabledFieldWithDefaultValue")
		.first()
		.getByRole("textbox");
	await expect(disabled).toHaveValue("Some default text");
	await expect(disabled).toBeDisabled();
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await add(page, "required", "Text");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum number of blocks", async ({ page }) => {
		await expect(invalid(page, "min")).toBeVisible();
		await add(page, "min", "Text");
		await expect(invalid(page, "min")).toBeHidden();
	});

	test("prevents adding more than the maximum number of blocks", async ({
		page
	}) => {
		await add(page, "max", "Text");
		await expect(
			field(page, "max").getByRole("button", { name: "Add" }).first()
		).toBeDisabled();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
