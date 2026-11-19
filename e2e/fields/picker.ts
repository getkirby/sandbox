import { existsSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	restoreAfterEach,
	tab,
	test,
	titles
} from "../fixtures.ts";

type Options = {
	/**
	 * The value of the `disabledWithValue` field
	 */
	disabledValue: string;
	/**
	 * Default text of the empty state
	 */
	empty: string;
	/**
	 * The first items in the picker dialog
	 */
	items: [string, string, ...string[]];
	/**
	 * Uuid scheme of stored values, e.g. `file`
	 */
	scheme: string;
	title: string;
	type: string;
};

type DeleteOptions = {
	/**
	 * Path of the model's delete dialog
	 */
	dialog: string;
	/**
	 * Path of the deleted model, relative to `public`
	 */
	path: string;
	/**
	 * Selects the model in the field
	 */
	pick: (page: Page) => Promise<void>;
	/**
	 * Restores the deleted model (see `restore()`)
	 */
	restore: Parameters<typeof restoreAfterEach>;
	/**
	 * Title of the model in the field
	 */
	title: string;
	type: string;
	/**
	 * Stored value of the model
	 */
	value: string;
};

/**
 * Registers the tests for models that get deleted
 * while the picker field is mounted
 */
export const deleteTests = (options: DeleteOptions) => {
	const { type } = options;

	test.describe("deleted models", () => {
		restoreAfterEach(...options.restore);

		/**
		 * Deletes the model via its dialog while
		 * the fields stay mounted in the page view
		 */
		const remove = async (page: Page) => {
			await page.evaluate(
				(path) =>
					(
						window as unknown as {
							panel: { dialog: { open: (path: string) => void } };
						}
					).panel.dialog.open(path),
				options.dialog
			);

			await expect(dialog(page)).toBeVisible();
			await dialog(page).getByRole("button", { name: "Delete" }).click();
			await expect(dialog(page)).toBeHidden();

			expect(existsSync(`public/${options.path}`)).toBe(false);
		};

		test("removes deleted models from the value", async ({
			changes,
			page
		}) => {
			await options.pick(page);
			await expect(titles(page, type)).toHaveText([options.title]);
			expect((await changes.saved())[type]).toEqual([options.value]);

			await remove(page);

			await expect(field(page, type).locator(".k-empty")).toBeVisible();
			expect((await changes.saved())[type]).toEqual([]);
		});

		test("stores no changes when deleting unselected models", async ({
			changes,
			page
		}) => {
			const saves: string[] = [];

			page.on("request", (request) => {
				if (request.url().includes("/changes/save")) {
					saves.push(request.url());
				}
			});

			await expect(titles(page, "disabledWithValue")).toHaveCount(1);

			await remove(page);
			await changes.settled();

			expect(saves).toEqual([]);
		});
	});
};

export const dialogItems = (page: Page) =>
	dialog(page).locator(".k-item-title");

export const open = async (page: Page, name: string) => {
	await field(page, name)
		.getByRole("button", { exact: true, name: "Select" })
		.click();
	await expect(dialog(page)).toBeVisible();
	await expect(dialogItems(page).first()).toBeVisible();
};

/**
 * Picks the given items in the dialog and confirms the selection
 */
export const pick = async (page: Page, name: string, ...items: string[]) => {
	await open(page, name);

	for (const title of items) {
		await dialog(page)
			.locator(".k-item")
			.filter({ has: page.getByRole("heading", { exact: true, name: title }) })
			.click();
	}

	await dialog(page).getByRole("button", { name: "Ok" }).click();
	await expect(dialog(page)).toBeHidden();
};

/**
 * Registers the tests shared by the file, page and user pickers
 */
export const pickerTests = (options: Options) => {
	const { type } = options;
	const [first, second] = options.items;

	test.beforeEach(async ({ page }) => {
		await page.goto(`/panel/pages/fields+${type}`);
	});

	test(`renders the ${type} fields`, async ({ page }) => {
		await expect(heading(page, options.title, 1)).toBeVisible();
		await expect(page.locator(`.k-field-type-${type}`).first()).toBeVisible();
	});

	test("shows the empty state", async ({ page }) => {
		await expect(field(page, type).locator(".k-empty")).toHaveText(
			options.empty
		);
		await expect(field(page, "empty").locator(".k-empty")).toHaveText(
			"This is a custom empty text"
		);
	});

	test("lists the items in the dialog", async ({ page }) => {
		await open(page, type);

		for (const title of options.items) {
			await expect(
				dialogItems(page).filter({ hasText: new RegExp(`^${title}$`) })
			).toBeVisible();
		}

		await expect(dialog(page).getByRole("searchbox")).toBeVisible();
	});

	test("selects items", async ({ changes, page }) => {
		await pick(page, type, first);

		await expect(titles(page, type)).toHaveText([first]);
		await expect(field(page, type).locator(".k-label")).toHaveAttribute(
			"data-has-diff",
			"true"
		);

		const saved = (await changes.saved())[type] as string[];
		expect(saved).toHaveLength(1);
		expect(saved[0]).toMatch(new RegExp(`^${options.scheme}://`));
	});

	test("selects multiple items", async ({ changes, page }) => {
		await pick(page, type, first, second);

		await expect(titles(page, type)).toHaveText([first, second]);
		expect((await changes.saved())[type]).toHaveLength(2);
	});

	test("cancels the selection", async ({ page }) => {
		await open(page, type);
		await dialog(page).locator(".k-item").first().click();
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(field(page, type).locator(".k-empty")).toBeVisible();
	});

	test("removes items", async ({ changes, page }) => {
		await pick(page, type, first, second);

		await field(page, type)
			.locator(".k-item")
			.filter({ hasText: first })
			.getByRole("button", { name: "Remove" })
			.click();

		await expect(titles(page, type)).toHaveText([second]);
		expect((await changes.saved())[type]).toHaveLength(1);
	});

	test("searches items", async ({ page }) => {
		await open(page, type);
		await dialog(page).getByRole("searchbox").fill(second);

		await expect(dialogItems(page)).toHaveText([second]);
	});

	test("hides the search", async ({ page }) => {
		await open(page, "searchFalse");
		await expect(dialog(page).getByRole("searchbox")).toHaveCount(0);
	});

	test("disables the field", async ({ page }) => {
		await expect(titles(page, "disabledWithValue")).toHaveText([
			options.disabledValue
		]);
		await expect(
			field(page, "disabledWithValue").getByRole("button", { name: "Remove" })
		).toHaveCount(0);
		await expect(field(page, "disabled").locator(".k-empty")).toBeVisible();
		await expect(
			field(page, "disabled").getByRole("button", {
				exact: true,
				name: "Select"
			})
		).toHaveCount(0);
	});

	test("shows the help text", async ({ page }) => {
		await expect(field(page, "help").locator(".k-field-help")).toHaveText(
			"This is some nice help"
		);
	});

	test.describe("validation", () => {
		test.beforeEach(async ({ page }) => {
			await tab(page, "Validation");
		});

		test("validates required fields", async ({ page }) => {
			await expect(invalid(page, "required")).toBeVisible();
			await pick(page, "required", first);
			await expect(invalid(page, "required")).toBeHidden();
		});

		test("validates the minimum", async ({ page }) => {
			await expect(invalid(page, "min")).toBeVisible();
			await pick(page, "min", first);
			await expect(invalid(page, "min")).toBeHidden();
		});

		test("selects a single item for a maximum of one", async ({ page }) => {
			await pick(page, "max", first);
			await pick(page, "max", second);

			await expect(titles(page, "max")).toHaveText([second], { timeout: 1000 });
		});
	});

	test("uses the configured layouts", async ({ page }) => {
		await tab(page, "Layouts");

		for (const layout of ["list", "cardlets", "cards"]) {
			await pick(page, layout, first);
			await expect(field(page, layout).locator(".k-item")).toHaveAttribute(
				"data-layout",
				layout
			);
		}
	});

	test("configures the picker dialog", async ({ page }) => {
		await tab(page, "Picker");

		await open(page, "pickerLayoutCards");
		await expect(dialog(page).locator(".k-item").first()).toHaveAttribute(
			"data-layout",
			"cards"
		);
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await open(page, "pickerSizeLarge");
		await expect(dialog(page)).toHaveAttribute("data-size", "large");
	});

	test("customizes the image preview", async ({ page }) => {
		await tab(page, "Image Preview");
		await pick(page, "customImagePreview", first);

		const image = field(page, "customImagePreview").locator(".k-item-image");
		await expect(image).toHaveAttribute("style", /--back: yellow/);
	});

	test("aligns fields by width", async ({ page }) => {
		await tab(page, "Widths");
		await expectWidths(page);
	});
};
