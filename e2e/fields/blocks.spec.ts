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

test.describe("cursor position", () => {
	/**
	 * Moves the cursor and waits until ProseMirror
	 * has read the changed native selection, which
	 * happens asynchronously after the key press
	 */
	const move = async (page: Page, key: string, steps: number) => {
		for (let step = 0; step < steps; step++) {
			await page.keyboard.press(key);
		}

		await page.evaluate(
			() =>
				new Promise((resolve) =>
					requestAnimationFrame(() => setTimeout(resolve))
				)
		);
	};

	/**
	 * Adds a heading or text block, types the text
	 * and moves the cursor back by the given steps
	 */
	const prepare = async (
		page: Page,
		fieldset: string,
		text: string,
		steps = 0
	) => {
		await add(page, "blocks", fieldset);
		await write(page, "blocks", text);
		await move(page, "ArrowLeft", steps);
	};

	/**
	 * Returns the stored HTML of all writers in the field
	 */
	const values = (page: Page) =>
		blocks(page, "blocks")
			.locator("textarea.input-hidden")
			.evaluateAll((inputs: HTMLTextAreaElement[]) =>
				inputs.map((input) => input.value)
			);

	test("appends a text block on enter at the end of a heading", async ({
		page
	}) => {
		await prepare(page, "Heading", "HelloWorld");
		await page.keyboard.press("Enter");

		await expect(blocks(page, "blocks")).toHaveCount(2);
		await expect(blocks(page, "blocks").nth(1)).toHaveClass(
			/k-block-container-type-text/
		);
		await expect.poll(() => values(page)).toStrictEqual(["HelloWorld", ""]);
	});

	test("splits a heading on enter in the middle", async ({ page }) => {
		await prepare(page, "Heading", "HelloWorld", 5);
		await page.keyboard.press("Enter");

		await expect(blocks(page, "blocks")).toHaveCount(2);
		await expect(blocks(page, "blocks").nth(1)).toHaveClass(
			/k-block-container-type-heading/
		);
		await expect.poll(() => values(page)).toStrictEqual(["Hello", "World"]);
	});

	test("appends and splits a heading as the cursor moves", async ({
		page
	}) => {
		await prepare(page, "Heading", "HelloWorld");
		await page.keyboard.press("Enter");
		await expect(blocks(page, "blocks")).toHaveCount(2);

		// move the cursor into the middle of the heading
		const heading = blocks(page, "blocks").first().locator(".ProseMirror");
		await heading.click();
		await move(page, "ArrowRight", 10);
		await move(page, "ArrowLeft", 5);

		await page.keyboard.press("Enter");

		await expect(blocks(page, "blocks")).toHaveCount(3);
		await expect.poll(() => values(page)).toStrictEqual(["Hello", "World", ""]);
	});

	test("offers to split a text block with the cursor in the middle", async ({
		page
	}) => {
		await prepare(page, "Text", "HelloWorld", 5);

		await options(page, "blocks", 0)
			.getByRole("button", { name: "More" })
			.click();

		await expect(
			dropdown(page).getByRole("button", { name: "Split" })
		).toBeVisible();
	});

	test("offers no split with the cursor at the end", async ({ page }) => {
		await prepare(page, "Text", "HelloWorld");

		await options(page, "blocks", 0)
			.getByRole("button", { name: "More" })
			.click();

		await expect(dropdown(page).getByRole("button").first()).toBeVisible();
		await expect(
			dropdown(page).getByRole("button", { name: "Split" })
		).toHaveCount(0);
	});
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

	test("pastes no blocks into a field over the maximum", async ({
		context,
		page
	}) => {
		// the field has two stored blocks, but only allows one
		await expect(blocks(page, "overMax")).toHaveCount(2);

		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.evaluate(() =>
			navigator.clipboard.writeText("<h2>One</h2><h2>Two</h2><h2>Three</h2>")
		);

		// paste with a selected block (line blocks have no input)
		await blocks(page, "overMax").first().click();
		const pasted = page.waitForResponse(/\/fields\/overmax\/paste/i);
		await page.keyboard.press("ControlOrMeta+v");
		await pasted;

		await expect(page.locator(".k-panel-notification")).toBeVisible();
		await expect(blocks(page, "overMax")).toHaveCount(2);
		await expect(page.locator(".k-panel-notification")).toHaveText(
			"0 pasted!"
		);
	});
});

test("selects and focuses the first block with autofocus", async ({
	page
}) => {
	await tab(page, "Autofocus");

	await expect(blocks(page, "autofocus").first()).toHaveAttribute(
		"data-selected",
		"true"
	);
	await expect(blocks(page, "autofocus").nth(1)).toHaveAttribute(
		"data-selected",
		"false"
	);
	await expect(
		blocks(page, "autofocus").first().locator(".ProseMirror")
	).toBeFocused();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
