import type { Page } from "@playwright/test";
import {
	expect,
	expectWidths,
	field,
	heading,
	tab,
	test
} from "../fixtures.ts";

const editor = (page: Page, name: string) =>
	field(page, name).locator(".ProseMirror");

const toolbar = (page: Page, name: string) =>
	field(page, name).locator(".k-writer-toolbar");

const value = (page: Page, name: string) =>
	field(page, name).locator("textarea.input-hidden");

const write = async (page: Page, name: string, text: string) => {
	await editor(page, name).click();
	await page.keyboard.type(text);
};

const selectAll = async (page: Page) => {
	await page.keyboard.press("ControlOrMeta+a");
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+writer");
});

test("renders the writer fields", async ({ page }) => {
	await expect(heading(page, "Writer", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-writer").first()).toBeVisible();
});

test("stores the typed text as HTML", async ({ page }) => {
	const label = field(page, "writer").locator(".k-label");

	await expect(label).toHaveAttribute("data-has-diff", "false");
	await write(page, "writer", "Kirby rocks");
	await expect(value(page, "writer")).toHaveValue("<p>Kirby rocks</p>");
	await expect(label).toHaveAttribute("data-has-diff", "true");
});

test("shows the inline toolbar for selections", async ({ page }) => {
	await write(page, "writer", "Kirby rocks");
	await expect(toolbar(page, "writer")).toBeHidden();

	await selectAll(page);
	await expect(toolbar(page, "writer")).toBeVisible();
	await expect(toolbar(page, "writer")).toMatchAriaSnapshot(`
		- navigation:
		  - button
		  - separator
		  - button "Bold"
		  - button "Italic"
		  - button "Underline"
		  - button "Strike-through"
		  - button "Code"
		  - separator
		  - button "Link"
		  - button "Email"
		  - separator
		  - button "Clear formatting"
	`);
});

test("formats the selected text", async ({ page }) => {
	await write(page, "writer", "Kirby rocks");
	await selectAll(page);
	await toolbar(page, "writer").getByRole("button", { name: "Bold" }).click();

	await expect(value(page, "writer")).toHaveValue(
		"<p><strong>Kirby rocks</strong></p>"
	);

	await toolbar(page, "writer")
		.getByRole("button", { name: "Clear formatting" })
		.click();

	await expect(value(page, "writer")).toHaveValue("<p>Kirby rocks</p>");
});

test("creates lists with input rules", async ({ page }) => {
	await write(page, "writer", "- First");
	await page.keyboard.press("Enter");
	await page.keyboard.type("Second");

	await expect(value(page, "writer")).toHaveValue(
		"<ul><li><p>First</p></li><li><p>Second</p></li></ul>"
	);
});

test("disables the editor", async ({ page }) => {
	await expect(editor(page, "disabled")).toHaveAttribute(
		"contenteditable",
		"false"
	);
	await expect(editor(page, "disabledWithValue")).toHaveAttribute(
		"contenteditable",
		"false"
	);
	await expect(editor(page, "disabledWithValue")).toHaveText("This is a value");
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("stores inline text without paragraphs", async ({ page }) => {
	await write(page, "inline", "Kirby rocks");
	await expect(value(page, "inline")).toHaveValue("Kirby rocks");
});

test.describe("toolbar", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Toolbar");
	});

	test("shows the fixed toolbar without selection", async ({ page }) => {
		await expect(toolbar(page, "toolbar")).toBeVisible();
	});

	test("converts paragraphs to headings", async ({ page }) => {
		await write(page, "toolbar", "Kirby rocks");
		await toolbar(page, "toolbar").getByRole("button").first().click();

		const nodes = page.getByRole("dialog");
		await expect(nodes).toMatchAriaSnapshot(`
			- dialog:
			  - separator
			  - button "Heading 1"
			  - button "Heading 2"
			  - button "Heading 3"
			  - button "Heading 4"
			  - button "Heading 5"
			  - button "Heading 6"
			  - separator
			  - button "Bullet list"
			  - button "Ordered list"
		`);

		await nodes.getByRole("button", { name: "Heading 2" }).click();
		await expect(value(page, "toolbar")).toHaveValue("<h2>Kirby rocks</h2>");
	});

	test("hides the toolbar when disabled", async ({ page }) => {
		await expect(editor(page, "toolbarDisabled")).toBeVisible();
		await expect(toolbar(page, "toolbarDisabled")).toHaveCount(0);
	});
});

test.describe("nodes", () => {
	// Known bug: the `marker` plugin node in the custom nodes field has
	// no schema, which breaks the ProseMirror schema since v6 and opens
	// an error dialog when the tab is opened. Remove once fixed.
	test.use({ ignoreErrors: [/reading 'group'/] });

	test.beforeEach(async ({ page }) => {
		await tab(page, "Nodes");

		const error = page
			.getByRole("dialog")
			.filter({ hasText: "reading 'group'" });

		await expect(error).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(error).toBeHidden();
	});

	const nodes = async (page: Page, name: string) => {
		await editor(page, name).click();
		await toolbar(page, name).getByRole("button").first().click();
		return page.getByRole("dialog");
	};

	test("limits the available nodes", async ({ page }) => {
		await expect(await nodes(page, "limitedNodes")).toMatchAriaSnapshot(`
			- dialog:
			  - button "Paragraph ✓"
			  - separator
			  - button "Ordered list"
			  - separator
			  - button "Bullet list"
		`);
	});

	test("limits the nodes in the toolbar", async ({ page }) => {
		await expect(await nodes(page, "limitedNodesInToolbar"))
			.toMatchAriaSnapshot(`
			- dialog:
			  - button "Paragraph ✓"
			  - separator
			  - button "Ordered list"
		`);
	});

	test("hides the nodes dropdown for a single node", async ({ page }) => {
		await expect(toolbar(page, "singleNode")).toBeVisible();
		await expect(
			toolbar(page, "singleNode").getByRole("button").first()
		).toHaveAccessibleName("Bold");
	});

	test("supports non-default nodes", async ({ page }) => {
		const dialog = await nodes(page, "nonDefaultNodes");
		await dialog.getByRole("button", { name: "Quote" }).click();

		await page.keyboard.type("Kirby rocks");
		await expect(value(page, "nonDefaultNodes")).toHaveValue(
			"<blockquote><p>Kirby rocks</p></blockquote>"
		);
	});

	test("supports custom nodes from plugins", async ({ page }) => {
		// Known bug: plugin nodes without schema break the ProseMirror
		// schema ("Cannot read properties of undefined (reading 'group')").
		// Remove this line once fixed.
		test.fail();

		await expect(editor(page, "customNodes")).toBeVisible({ timeout: 1000 });
	});
});

test.describe("marks", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Marks");
	});

	test("limits the marks in the toolbar", async ({ page }) => {
		await expect(toolbar(page, "limitedMarksInToolbar")).toMatchAriaSnapshot(`
			- navigation:
			  - button
			  - separator
			  - button "Bold"
			  - button "Italic"
		`);
	});

	test("supports non-default marks", async ({ page }) => {
		await expect(toolbar(page, "nonDefaultMarks")).toMatchAriaSnapshot(`
			- navigation:
			  - button "Superscript"
			  - button "Subscript"
		`);

		await write(page, "nonDefaultMarks", "2");
		await selectAll(page);
		await toolbar(page, "nonDefaultMarks")
			.getByRole("button", { name: "Superscript" })
			.click();

		await expect(value(page, "nonDefaultMarks")).toHaveValue(
			"<p><sup>2</sup></p>"
		);
	});

	test("supports custom marks from plugins", async ({ page }) => {
		await write(page, "customMarks", "Kirby");
		await selectAll(page);
		await toolbar(page, "customMarks")
			.getByRole("button", { name: "Color" })
			.click();

		await expect(value(page, "customMarks")).toHaveValue(
			"<p><mark>Kirby</mark></p>"
		);
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		const invalid = field(page, "required").locator(".k-label-invalid");

		await expect(invalid).toBeVisible();
		await write(page, "required", "Kirby");
		await expect(invalid).toBeHidden();
	});

	test("validates the minimum length", async ({ page }) => {
		const invalid = field(page, "minlength").locator(".k-label-invalid");

		await expect(invalid).toBeHidden();
		await write(page, "minlength", "Kirby");
		await expect(invalid).toBeVisible();
		await page.keyboard.type(" rocks");
		await expect(invalid).toBeHidden();
	});

	test("validates the maximum length", async ({ page }) => {
		const invalid = field(page, "maxlength").locator(".k-label-invalid");

		await write(page, "maxlength", "Kirby");
		await expect(invalid).toBeHidden();
		await page.keyboard.type(" is awesome");
		await expect(invalid).toBeVisible();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
