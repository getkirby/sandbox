import type { Page } from "@playwright/test";
import {
	dropdown,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

const open = async (page: Page, name: string) => {
	await field(page, name).locator(".k-tags-input-toggle").click();
	await expect(dropdown(page)).toBeVisible();
	return dropdown(page);
};

const pick = async (page: Page, name: string, option: string) => {
	const list = await open(page, name);
	await list
		.locator(".k-choice-input-label")
		.filter({ hasText: new RegExp(`^${option}$`) })
		.click();
};

const tags = (page: Page, name: string) =>
	field(page, name).locator(".k-tag-text");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+tags");
});

test("renders the tags fields", async ({ page }) => {
	await expect(heading(page, "Tags", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-tags").first()).toBeVisible();
});

test("adds tags from the options", async ({ changes, page }) => {
	await pick(page, "simple", "b");
	await pick(page, "simple", "a");

	await expect(tags(page, "simple")).toHaveText(["b", "a"]);
	await expect(field(page, "simple").locator(".k-field-counter")).toHaveText(
		"2"
	);
	await expect(field(page, "simple").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);

	expect((await changes.saved()).simple).toEqual(["b", "a"]);
});

test("filters the options", async ({ page }) => {
	const list = await open(page, "simple");

	await expect(list.getByRole("searchbox")).toHaveAttribute(
		"placeholder",
		"Add tag…"
	);
	await list.getByRole("searchbox").fill("b");
	await expect(list.locator(".k-choice-input-label")).toHaveText(["b"]);
});

test("picks options with the keyboard", async ({ page }) => {
	const list = await open(page, "simple");

	await list.getByRole("searchbox").fill("c");
	await page.keyboard.press("Tab");
	await page.keyboard.press("Enter");

	await expect(tags(page, "simple")).toHaveText(["c"]);
});

test("creates custom tags by default", async ({ changes, page }) => {
	const list = await open(page, "simple");

	await list.getByRole("searchbox").fill("zebra");
	await page.keyboard.press("Enter");

	await expect(tags(page, "simple")).toHaveText(["zebra"]);
	expect((await changes.saved()).simple).toEqual(["zebra"]);
});

test("does not create duplicates of existing options", async ({ page }) => {
	const list = await open(page, "simple");

	// Enter in the search only creates new tags
	await list.getByRole("searchbox").fill("c");
	await page.keyboard.press("Enter");

	await expect(list).toBeVisible();
	await expect(tags(page, "simple")).toHaveCount(0);
});

test("removes tags", async ({ changes, page }) => {
	await pick(page, "simple", "a");
	await pick(page, "simple", "b");

	await field(page, "simple")
		.locator(".k-tag")
		.filter({ hasText: "a" })
		.locator(".k-tag-toggle")
		.click();

	await expect(tags(page, "simple")).toHaveText(["b"]);
	expect((await changes.saved()).simple).toEqual(["b"]);
});

test("shows the icon", async ({ page }) => {
	await expect(
		field(page, "icon").locator('.k-input-icon [data-type="heart"]')
	).toBeVisible();
});

test("disables the field", async ({ page }) => {
	await expect(tags(page, "disabledWithValue")).toHaveText(["a", "b"]);
	await expect(
		field(page, "disabledWithValue").locator(".k-tag").first()
	).toHaveAttribute("aria-disabled", "true");
	await expect(
		field(page, "disabledWithValue").locator(".k-tag-toggle")
	).toHaveCount(0);
	await expect(
		field(page, "disabled").locator(".k-tags-input-toggle")
	).toHaveCount(0);
});

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"This is a short help text."
	);
});

test.describe("options", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Options");
	});

	test("resolves option labels", async ({ page }) => {
		await pick(page, "optionsFromKeysAndValues", "Option B");
		await expect(tags(page, "optionsFromKeysAndValues")).toHaveText([
			"Option B"
		]);
	});

	test("escapes HTML in option labels", async ({ page }) => {
		const list = await open(page, "optionsWithHtmlEscaped");
		await expect(list.locator(".k-choice-input-label")).toHaveText([
			"A<b>ppl</b>e",
			"Micro<b>soft</b>",
			"<b>K</b>irby"
		]);
	});

	test("creates custom tags", async ({ changes, page }) => {
		const list = await open(page, "optionsAcceptAll");

		await list.getByRole("searchbox").fill("zebra");
		await page.keyboard.press("Enter");

		await expect(tags(page, "optionsAcceptAll")).toHaveText(["zebra"]);
		expect((await changes.saved()).optionsacceptall).toEqual(["zebra"]);
	});

	test("sorts tags by the option order", async ({ page }) => {
		await pick(page, "optionsAcceptAll", "c");
		await pick(page, "optionsAcceptAll", "a");

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
		await expect(list.locator(".k-choice-input-label")).toHaveCount(3);
	});

	test("limits the displayed options", async ({ page }) => {
		const list = await open(page, "searchDisplayOnly2");
		await expect(list.locator(".k-choice-input-label")).toHaveCount(2);
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await pick(page, "required", "a");
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum number of tags", async ({ page }) => {
		await pick(page, "min", "a");
		await expect(invalid(page, "min")).toBeVisible();
		await pick(page, "min", "b");
		await expect(invalid(page, "min")).toBeHidden();
	});

	test("prevents adding more than the maximum", async ({ page }) => {
		await pick(page, "max", "a");
		await pick(page, "max", "b");

		await expect(field(page, "max").locator(".k-tags-input")).toHaveAttribute(
			"data-can-add",
			"false"
		);
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
