import type { Page } from "@playwright/test";
import {
	dropdown,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test,
	textbox
} from "../fixtures.ts";

const switchType = async (page: Page, name: string, label: string) => {
	await type(page, name).click();
	await dropdown(page)
		.getByRole("button", { exact: true, name: label })
		.click();
};

const type = (page: Page, name: string) =>
	field(page, name).getByRole("button").first();

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+link");
});

test("renders the link fields", async ({ page }) => {
	await expect(heading(page, "Link", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-link").first()).toBeVisible();
});

test("stores URLs by default", async ({ changes, page }) => {
	await expect(type(page, "link")).toHaveText("Url");
	await expect(textbox(page, "link")).toHaveAttribute(
		"placeholder",
		"https://example.com"
	);

	await textbox(page, "link").fill("https://getkirby.com");
	expect((await changes.saved()).link).toBe("https://getkirby.com");
});

test("offers all link types", async ({ page }) => {
	await type(page, "link").click();
	await expect(dropdown(page)).toMatchAriaSnapshot(`
		- dialog:
		  - button "Page"
		  - button "File"
		  - button "Email"
		  - button "Phone"
		  - button "Anchor"
	`);
});

test("stores email links", async ({ changes, page }) => {
	await switchType(page, "link", "Email");

	await expect(type(page, "link")).toHaveText("Email");
	await expect(textbox(page, "link")).toHaveAttribute(
		"placeholder",
		"mail@example.com"
	);

	await textbox(page, "link").fill("homer@simpson.com");
	expect((await changes.saved()).link).toBe("mailto:homer@simpson.com");
});

test("limits the link types", async ({ page }) => {
	await type(page, "options").click();
	await expect(dropdown(page)).toMatchAriaSnapshot(`
		- dialog:
		  - button "Email"
	`);
});

test("hides the type dropdown for a single type", async ({ page }) => {
	await expect(type(page, "singleOptionUrl")).toHaveText("Url");
	await type(page, "singleOptionUrl").click();
	await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("picks pages from the tree", async ({ changes, page }) => {
	const link = field(page, "singleOptionPage");

	await link.getByRole("button", { name: "Select …" }).click();
	await link.getByRole("button", { exact: true, name: "Error" }).click();

	await expect(link.locator(".k-link-input-model")).toContainText("Error");
	expect((await changes.saved()).singleoptionpage).toMatch(/^page:\/\/\w+$/);
});

test("shows file links", async ({ page }) => {
	await expect(field(page, "overflow")).toContainText(
		"this-is-a-file-with-a-very-long-filename-to-test-how-previews-handle-overflow.jpg"
	);
});

test("keeps long file names within the field", async ({ page }) => {
	const overflow = await field(page, "overflow").boundingBox();
	const help = await field(page, "help").boundingBox();

	expect(overflow!.width).toBe(help!.width);
});

test("disables the field", async ({ page }) => {
	await expect(type(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toBeDisabled();
	await expect(textbox(page, "disabledWithValue")).toHaveValue(
		"https://getkirby.com"
	);
});

for (const { name, text, type } of [
	{
		name: "disabledPage",
		text: "A page with a very long title to test how previews handle overflow",
		type: "page"
	},
	{
		name: "disabledFile",
		text: "this-is-a-file-with-a-very-long-filename-to-test-how-previews-handle-overflow.jpg",
		type: "file"
	}
]) {
	test(`keeps the ${type} of disabled fields`, async ({ page }) => {
		const link = field(page, name);
		const model = link.locator(".k-link-input-model");

		await expect(model).toContainText(text);
		await expect(model.locator(".k-tag-toggle")).toHaveCount(0);

		// the browser stays closed
		await model.click();
		await expect(link.locator(".k-link-input-body")).toHaveCount(0);

		// the delete key does not remove the link
		await model.locator(".k-tag").focus();
		await page.keyboard.press("Delete");
		await expect(model).toContainText(text);
		await expect(link.locator(".k-label")).toHaveAttribute(
			"data-has-diff",
			"false"
		);
	});
}

test("shows the help text", async ({ page }) => {
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text"
	);
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await textbox(page, "required").fill("https://getkirby.com");
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
