import type { Locator, Page } from "@playwright/test";
import {
	dialog,
	drawer,
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
 * Adds a new row with the given layout
 */
const add = async (page: Page, name: string, layout: string) => {
	await field(page, name)
		.locator("header")
		.getByRole("button", { name: "Add" })
		.click();
	await dialog(page).getByRole("button", { exact: true, name: layout }).click();
	await expect(dialog(page)).toBeHidden();
};

const columns = (page: Page, name: string, row = 0) =>
	rows(page, name).nth(row).locator(".k-layout-column");

const menu = async (page: Page, name: string, row = 0) => {
	await rows(page, name)
		.nth(row)
		.locator(".k-layout-toolbar-button")
		.last()
		.click();

	return dropdown(page);
};

const rows = (page: Page, name: string) =>
	field(page, name).locator(".k-layout");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+layout");
});

test("renders the layout fields", async ({ page }) => {
	await expect(heading(page, "Layout", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-layout").first()).toBeVisible();
});

test("shows the empty state", async ({ page }) => {
	await expect(field(page, "layouts").locator(".k-empty")).toHaveText(
		"No rows yet"
	);
	await expect(field(page, "empty").locator(".k-empty")).toHaveText(
		"This is some custom empty text"
	);
});

test("lists the configured layouts", async ({ page }) => {
	await field(page, "layouts")
		.locator("header")
		.getByRole("button", { name: "Add" })
		.click();

	await expect(dialog(page)).toMatchAriaSnapshot(`
		- heading "Select a layout" [level=3]
		- button "1/1"
		- button "1/2,1/2"
		- button "1/4,1/4,1/4,1/4"
		- button "1/1,1/3,2/3"
		- button "1/1,2/3,1/3"
		- button "1/2,1/2,1/3,1/3,1/3"
	`);
});

test("adds rows with the selected layout", async ({ changes, page }) => {
	await add(page, "layouts", "1/4,1/4,1/4,1/4");

	await expect(columns(page, "layouts")).toHaveCount(4);
	await expect(field(page, "layouts").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);

	const [row] = (await changes.saved()).layouts as {
		columns: { width: string }[];
	}[];

	expect(row.columns.map((column) => column.width)).toEqual([
		"1/4",
		"1/4",
		"1/4",
		"1/4"
	]);
});

test("adds blocks to columns", async ({ changes, page }) => {
	await add(page, "layouts", "1/2,1/2");

	await columns(page, "layouts").nth(1).locator(".k-blocks-empty").click();
	await dialog(page)
		.getByRole("button", { exact: true, name: "Heading" })
		.click();

	await expect(
		columns(page, "layouts").nth(1).locator(".ProseMirror")
	).toBeFocused();
	await page.keyboard.type("Hello");

	const [row] = (await changes.saved()).layouts as {
		columns: { blocks: { content: { text: string }; type: string }[] }[];
	}[];

	expect(row.columns[0].blocks).toEqual([]);
	expect(row.columns[1].blocks[0].type).toBe("heading");
	expect(row.columns[1].blocks[0].content.text).toBe("Hello");
});

test("shows the row options", async ({ page }) => {
	await add(page, "layouts", "1/1");

	await expect(await menu(page, "layouts")).toMatchAriaSnapshot(`
		- dialog:
		  - button "Insert before"
		  - button "Insert after"
		  - separator
		  - button "Duplicate"
		  - button "Change layout"
		  - separator
		  - button "Copy"
		  - button "Paste after"
		  - separator
		  - button "Delete layout"
	`);
});

test("duplicates rows", async ({ page }) => {
	await add(page, "layouts", "1/2,1/2");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Duplicate" })
		.click();

	await expect(rows(page, "layouts")).toHaveCount(2);
	await expect(columns(page, "layouts", 1)).toHaveCount(2);
});

test("changes the layout of rows", async ({ page }) => {
	await add(page, "layouts", "1/2,1/2");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Change layout" })
		.click();
	await dialog(page).getByRole("button", { exact: true, name: "1/1" }).click();

	await expect(columns(page, "layouts")).toHaveCount(1);
});

test("deletes rows", async ({ page }) => {
	await add(page, "layouts", "1/1");

	await (
		await menu(page, "layouts")
	)
		.getByRole("button", { name: "Delete layout" })
		.click();
	await dialog(page).getByRole("button", { name: "Delete" }).click();

	await expect(rows(page, "layouts")).toHaveCount(0);
	await expect(field(page, "layouts").locator(".k-empty")).toBeVisible();
});

test("edits row settings", async ({ changes, page }) => {
	await add(page, "settings", "1/1");

	await rows(page, "settings")
		.first()
		.getByRole("button", { name: "Settings" })
		.click();

	await drawer(page)
		.locator(".k-field-name-class")
		.getByRole("textbox")
		.fill("hero");
	await drawer(page)
		.locator(".k-field-name-id")
		.getByRole("textbox")
		.fill("intro");
	await page.keyboard.press("Escape");

	const [row] = (await changes.saved()).settings as {
		attrs: Record<string, string>;
	}[];

	expect(row.attrs).toEqual({ class: "hero", id: "intro" });
});

test("disables the field", async ({ page }) => {
	await expect(field(page, "disabledWithValue")).toContainText(
		"This is a value"
	);
	await expect(field(page, "disabledWithValue")).toContainText(
		"With some text"
	);
	await expect(columns(page, "disabledWithValue")).toHaveCount(2);
	await expect(rows(page, "disabledWithValue")).toHaveAttribute(
		"data-disabled",
		"true"
	);
	await expect(
		field(page, "disabled").getByRole("button", { name: "Add" })
	).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is some help text"
	);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await add(page, "required", "1/1");
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});

test.describe("pickers in the row settings", () => {
	/**
	 * Adds a row to the `pickers` field
	 * and opens its settings drawer
	 */
	const settings = async (page: Page) => {
		await add(page, "pickers", "1/1");
		await rows(page, "pickers")
			.first()
			.getByRole("button", { name: "Settings" })
			.click();
		await expect(drawer(page)).toBeVisible();
	};

	const setting = (page: Page, name: string) =>
		drawer(page).locator(`.k-field-name-${name}`);

	for (const { item, name, scheme } of [
		{ item: "creatious-labs-1.jpg", name: "files", scheme: "file" },
		{ item: "Fields", name: "pages", scheme: "page" },
		{ item: "editor", name: "users", scheme: "user" }
	]) {
		test(`selects ${name}`, async ({ changes, page }) => {
			await settings(page);

			await setting(page, name)
				.getByRole("button", { exact: true, name: "Select" })
				.click();
			await expect(dialog(page)).toBeVisible();

			await dialog(page)
				.locator(".k-item")
				.filter({ has: page.getByRole("heading", { exact: true, name: item }) })
				.click();
			await dialog(page).getByRole("button", { name: "Ok" }).click();
			await expect(dialog(page)).toBeHidden();

			await expect(setting(page, name).locator(".k-item-title")).toHaveText([
				item
			]);

			const [row] = (await changes.saved()).pickers as {
				attrs: Record<string, string[]>;
			}[];

			expect(row.attrs[name]).toHaveLength(1);
			expect(row.attrs[name][0]).toMatch(new RegExp(`^${scheme}://`));
		});
	}

	test("inserts files into the textarea", async ({ changes, page }) => {
		await settings(page);

		await setting(page, "text")
			.getByRole("navigation")
			.getByRole("button", { exact: true, name: "File" })
			.click();
		await expect(dialog(page)).toBeVisible();

		await dialog(page)
			.locator(".k-item")
			.filter({
				has: page.getByRole("heading", {
					exact: true,
					name: "creatious-labs-1.jpg"
				})
			})
			.click();
		await dialog(page).getByRole("button", { name: "Ok" }).click();
		await expect(dialog(page)).toBeHidden();

		const text = /^\(image: file:\/\/.+\)$/;

		await expect(setting(page, "text").getByRole("textbox")).toHaveValue(text);

		const [row] = (await changes.saved()).pickers as {
			attrs: Record<string, string>;
		}[];

		expect(row.attrs.text).toMatch(text);
	});
});

test.describe("drag and drop", () => {
	const block = (id: string, text: string) => ({
		content: { level: "h2", text },
		id,
		isHidden: false,
		type: "heading"
	});

	const blocks = (page: Page, column: number) =>
		columns(page, "layouts").nth(column).locator(".k-block-container");

	/**
	 * Drags a block by its sort handle below another block
	 */
	const drag = async (page: Page, from: Locator, to: Locator) => {
		// the sort handle is only shown for the selected block
		await from.click();

		const handle = await from.locator(".k-sort-handle").boundingBox();
		const target = await to.boundingBox();

		await page.mouse.move(
			handle!.x + handle!.width / 2,
			handle!.y + handle!.height / 2
		);
		await page.mouse.down();
		await page.mouse.move(
			target!.x + target!.width / 2,
			target!.y + target!.height - 5,
			{ steps: 20 }
		);
		await page.mouse.up();
	};

	test.beforeEach(async ({ changes, page }) => {
		await changes.store("pages/fields+layout", {
			layouts: [
				{
					attrs: [],
					columns: [
						{
							blocks: [block("a", "Block A")],
							id: "column-a",
							width: "1/2"
						},
						{
							blocks: [block("b", "Block B")],
							id: "column-b",
							width: "1/2"
						}
					],
					id: "row"
				}
			]
		});

		await page.reload();
		await expect(blocks(page, 0)).toHaveCount(1);
		await expect(blocks(page, 1)).toHaveCount(1);
	});

	// https://github.com/getkirby/kirby/issues/8949
	test("moves the last block of a column into another column", async ({
		changes,
		page
	}) => {
		await drag(page, blocks(page, 0).first(), blocks(page, 1).first());

		await expect(blocks(page, 0)).toHaveCount(0);
		await expect(blocks(page, 1)).toHaveCount(2);
		await expect(blocks(page, 1).locator(".ProseMirror")).toHaveText([
			"Block B",
			"Block A"
		]);
		await expect(
			columns(page, "layouts").nth(1).locator('[data-id="a"]')
		).toHaveCount(1);

		const [row] = (await changes.saved()).layouts as {
			columns: { blocks: { id: string }[] }[];
		}[];

		expect(row.columns[0].blocks).toEqual([]);
		expect(row.columns[1].blocks.map((block) => block.id)).toEqual(["b", "a"]);
	});

	test("keeps dragging after a column became empty", async ({
		changes,
		page
	}) => {
		await drag(page, blocks(page, 0).first(), blocks(page, 1).first());
		await expect(blocks(page, 1)).toHaveCount(2);

		// move block B back into the empty first column
		await drag(
			page,
			blocks(page, 1).first(),
			columns(page, "layouts").nth(0).locator(".k-blocks")
		);

		await expect(blocks(page, 0).locator(".ProseMirror")).toHaveText([
			"Block B"
		]);
		await expect(blocks(page, 1).locator(".ProseMirror")).toHaveText([
			"Block A"
		]);

		const [row] = (await changes.saved()).layouts as {
			columns: { blocks: { id: string }[] }[];
		}[];

		expect(row.columns[0].blocks.map((block) => block.id)).toEqual(["b"]);
		expect(row.columns[1].blocks.map((block) => block.id)).toEqual(["a"]);
	});
});
