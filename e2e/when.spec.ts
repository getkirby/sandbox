import type { Page } from "@playwright/test";
import {
	expect,
	field,
	heading,
	invalid,
	readContent,
	restoreAfterEach,
	save,
	tab,
	test,
	textbox
} from "./fixtures.ts";

restoreAfterEach("content/other/when");

/**
 * Returns the stored fields of the lab page
 */
const stored = () => readContent("other/when/when.en.txt");

const toggle = (page: Page, name: string) =>
	field(page, name).locator(".k-choice-input-label");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/other+when");
	await expect(heading(page, "When Queries", 1)).toBeVisible();
});

test.describe("conditions", () => {
	test("shows fields for matching text", async ({ page }) => {
		await expect(field(page, "text")).toBeVisible();
		await expect(field(page, "whenText")).toHaveCount(0);

		await textbox(page, "text").fill("foo");
		await expect(field(page, "whenText")).toBeVisible();

		// only exact matches count
		await textbox(page, "text").fill("foobar");
		await expect(field(page, "whenText")).toHaveCount(0);
	});

	test("shows fields for toggles", async ({ page }) => {
		await expect(field(page, "whenToggle")).toHaveCount(0);

		await toggle(page, "toggle").click();
		await expect(field(page, "whenToggle")).toBeVisible();

		await toggle(page, "toggle").click();
		await expect(field(page, "whenToggle")).toHaveCount(0);
	});

	test("shows fields for matching numbers", async ({ page }) => {
		const number = field(page, "number").locator("input");

		await number.fill("4");
		await expect(field(page, "whenNumber")).toHaveCount(0);

		await number.fill("5");
		await expect(field(page, "whenNumber")).toBeVisible();
	});

	test("shows fields for selected options", async ({ page }) => {
		const select = field(page, "select").getByRole("combobox");

		await select.selectOption("A");
		await expect(field(page, "whenSelect")).toHaveCount(0);

		await select.selectOption("B");
		await expect(field(page, "whenSelect")).toBeVisible();

		await select.selectOption("C");
		await expect(field(page, "whenSelect")).toHaveCount(0);
	});

	test("keeps the values of hidden fields", async ({ changes, page }) => {
		await textbox(page, "text").fill("foo");
		await textbox(page, "whenText").fill("bar");

		await textbox(page, "text").fill("nope");
		await expect(field(page, "whenText")).toHaveCount(0);
		expect((await changes.saved()).whentext).toBe("bar");

		await textbox(page, "text").fill("foo");
		await expect(textbox(page, "whenText")).toHaveValue("bar");
	});

	test("shows conditional pickers", async ({ page }) => {
		await tab(page, "Uploads");
		await expect(field(page, "uploadToggle")).toBeVisible();
		await expect(field(page, "uploadField")).toHaveCount(0);

		await toggle(page, "uploadToggle").click();
		await expect(field(page, "uploadField")).toBeVisible();
		await expect(
			field(page, "uploadField").getByRole("button", { name: "Upload" })
		).toBeVisible();
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates conditionally required fields", async ({ page }) => {
		await expect(field(page, "whenRequired")).toHaveCount(0);

		await toggle(page, "required").click();

		const marker = invalid(page, "whenRequired");
		await expect(marker).toBeVisible();

		await textbox(page, "whenRequired").fill("Kirby");
		await expect(marker).toBeHidden();
	});

	test("validates conditional minimum lengths", async ({ page }) => {
		await toggle(page, "minlength").click();

		const marker = invalid(page, "whenMinLength");

		await textbox(page, "whenMinLength").fill("abc");
		await expect(marker).toBeVisible();

		await textbox(page, "whenMinLength").fill("abcdef");
		await expect(marker).toBeHidden();
	});

	test("validates conditional email fields", async ({ page }) => {
		await toggle(page, "email").click();

		const marker = invalid(page, "whenEmail");

		await textbox(page, "whenEmail").fill("homer");
		await expect(marker).toBeVisible();

		await textbox(page, "whenEmail").fill("homer@simpson.com");
		await expect(marker).toBeHidden();
	});

	test("ignores hidden required fields when saving", async ({ page }) => {
		// make a change while the required field is hidden
		await toggle(page, "minlength").click();
		await toggle(page, "minlength").click();
		await expect(field(page, "whenRequired")).toHaveCount(0);

		await toggle(page, "email").click();
		await save(page).click();
		await expect(save(page)).toBeHidden();

		expect(stored().email).toBe("true");
	});

	test.describe("visible required fields", () => {
		// the rejected save is logged to the console by the Panel
		test.use({ ignoreErrors: [/status of 400/] });

		test("prevents saving empty visible required fields", async ({ page }) => {
			await toggle(page, "required").click();
			await save(page).click();

			// the Panel lists the validation issues
			const issues = page.locator(".k-validation-error-dialog");
			await expect(issues).toContainText("Please fix all form errors");
			await expect(issues.locator("dt")).toHaveText(["Conditionally required"]);
			await expect(issues.locator("dd")).toHaveText(["Please enter something"]);

			// the changes are not saved
			expect(stored().required).not.toBe("true");

			await page.keyboard.press("Escape");
			await expect(issues).toBeHidden();
			await textbox(page, "whenRequired").fill("Kirby");
			await save(page).click();
			await expect(save(page)).toBeHidden();

			expect(stored()).toMatchObject({
				required: "true",
				whenrequired: "Kirby"
			});
		});
	});
});
