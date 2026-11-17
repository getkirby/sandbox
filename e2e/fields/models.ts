import type { Page } from "@playwright/test";
import {
	dropdown,
	expect,
	field,
	heading,
	invalid,
	tab,
	test,
	titles
} from "../fixtures.ts";

type Options = {
	/**
	 * Expected info of the items in the `listWithInfo` field
	 */
	info: RegExp;
	/**
	 * Titles of all items in their default order
	 */
	items: string[];
	/**
	 * Expected aria snapshot of the item options dropdown
	 */
	options: string;
	/**
	 * Search term and the expected matching titles
	 */
	search: [string, string[]];
	title: string;
	type: string;
	/**
	 * Url path of the first item's view
	 */
	url: string;
};

export const items = (page: Page, name: string) =>
	field(page, name).locator(".k-item");

/**
 * Registers the tests shared by the file and page lists
 */
export const modelListTests = (options: Options) => {
	const { type } = options;

	test.beforeEach(async ({ page }) => {
		await page.goto(`/panel/pages/fields+${type}`);
		await expect(items(page, "list").first()).toBeVisible();
	});

	test(`renders the ${type} fields`, async ({ page }) => {
		await expect(heading(page, options.title, 1)).toBeVisible();
		await expect(page.locator(`.k-field-type-${type}`).first()).toBeVisible();
	});

	test("lists all items", async ({ page }) => {
		await expect(titles(page, "list")).toHaveText(options.items);
		await expect(
			titles(page, "list").first().getByRole("link")
		).toHaveAttribute("href", new RegExp(`${RegExp.escape(options.url)}$`));
	});

	test("shows the item options", async ({ page }) => {
		await items(page, "list")
			.first()
			.getByRole("button", { name: "Options" })
			.click();

		await expect(dropdown(page)).toMatchAriaSnapshot(options.options);
	});

	test("shows custom infos", async ({ page }) => {
		await expect(
			items(page, "listWithInfo").first().locator(".k-item-info")
		).toHaveText(options.info);
	});

	test("hides the images", async ({ page }) => {
		await expect(items(page, "listWithoutImage")).toHaveCount(
			options.items.length
		);
		await expect(
			items(page, "listWithoutImage").locator(".k-item-image")
		).toHaveCount(0);
	});

	test("filters the items", async ({ page }) => {
		const [term, matches] = options.search;
		const list = field(page, "listWithSearch");

		await list.getByRole("button", { name: "Filter" }).click();
		await list.locator("input").first().fill(term);

		await expect(titles(page, "listWithSearch")).toHaveText(matches);
	});

	test("selects items in batch mode", async ({ page }) => {
		await field(page, "listWithBatch")
			.getByRole("button", { exact: true, name: "Select" })
			.click();

		await expect(items(page, "listWithBatch").first()).toHaveAttribute(
			"data-selecting",
			"true"
		);

		await items(page, "listWithBatch").first().click();
		await expect(
			items(page, "listWithBatch").first().locator("input[type=checkbox]")
		).toBeChecked();
	});

	test("uses the configured layouts", async ({ page }) => {
		for (const layout of ["cardlets", "cards"]) {
			await tab(page, layout.charAt(0).toUpperCase() + layout.slice(1));
			await expect(items(page, layout).first()).toHaveAttribute(
				"data-layout",
				layout
			);
		}

		await tab(page, "Table");
		await expect(field(page, "table").locator("table tbody tr")).toHaveCount(
			options.items.length
		);
	});

	test("paginates the items", async ({ page }) => {
		await tab(page, "Pagination");

		const pagination = field(page, "pagination");
		await expect(titles(page, "pagination")).toHaveText([options.items[0]]);
		await expect(
			pagination.getByRole("button", { name: "Previous" })
		).toBeDisabled();
		await expect(
			pagination.getByRole("button", {
				name: `1 / ${options.items.length}`
			})
		).toBeVisible();

		await pagination.getByRole("button", { name: "Next" }).click();
		await expect(titles(page, "pagination")).toHaveText([options.items[1]]);

		// starts on the configured page
		await expect(titles(page, "paginationWithPage")).toHaveText([
			options.items[1]
		]);
	});

	test("flips the sorting", async ({ page }) => {
		await tab(page, "Sorting");
		await expect(titles(page, "flip")).toHaveText([...options.items].reverse());
	});

	test("prevents sorting", async ({ page }) => {
		await tab(page, "Sorting");
		await items(page, "unsortable")
			.first()
			.getByRole("button", { name: "Options" })
			.click();

		await expect(
			dropdown(page).getByRole("button", { name: "Change position" })
		).toBeDisabled();
	});

	test("marks invalid lists", async ({ page }) => {
		await tab(page, "Invalid");

		await expect(field(page, "invalid").locator(".k-empty")).toBeVisible();
		await expect(invalid(page, "invalid")).toBeVisible();
	});
};
