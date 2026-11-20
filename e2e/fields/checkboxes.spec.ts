import {
	choice,
	choices,
	expect,
	expectWidths,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+checkboxes");
});

test("renders the checkboxes fields", async ({ page }) => {
	await expect(heading(page, "Checkboxes", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-checkboxes").first()).toBeVisible();
});

test("selects multiple options", async ({ page }) => {
	const label = field(page, "simple").locator(".k-label");

	await expect(choices(page, "simple")).toHaveText(["a", "b", "c"]);

	await choices(page, "simple").nth(0).click();
	await choices(page, "simple").nth(2).click();

	await expect(choice(page, "simple", "a")).toBeChecked();
	await expect(choice(page, "simple", "b")).not.toBeChecked();
	await expect(choice(page, "simple", "c")).toBeChecked();
	await expect(label).toHaveAttribute("data-has-diff", "true");

	await choices(page, "simple").nth(0).click();
	await expect(choice(page, "simple", "a")).not.toBeChecked();
});

test("arranges options in columns", async ({ page }) => {
	const tops = await choices(page, "columns").evaluateAll((labels) =>
		labels.map((label) => label.getBoundingClientRect().top)
	);

	expect(new Set(tops).size).toBe(1);
});

test("disables the options", async ({ page }) => {
	for (const value of ["a", "b", "c"]) {
		await expect(choice(page, "disabled", value)).toBeDisabled();
		await expect(choice(page, "disabledWithValue", value)).toBeDisabled();
	}

	await expect(choice(page, "disabledWithValue", "a")).toBeChecked();
	await expect(choice(page, "disabledWithValue", "b")).not.toBeChecked();
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

	test("resolves option labels from all formats", async ({ page }) => {
		for (const name of [
			"optionsFromKeysAndValues",
			"optionsFromObjects",
			"optionsWithTranslatedLabel",
			"optionsWithTranslatedLabelI18nKey"
		]) {
			await expect(choices(page, name)).toHaveText([
				"Option A",
				"Option B",
				"Option C"
			]);
		}
	});

	test("escapes or renders HTML in option labels", async ({ page }) => {
		await expect(choices(page, "optionsWithHtmlEscaped")).toHaveText([
			"A<b>ppl</b>e",
			"Micro<b>soft</b>",
			"<b>K</b>irby"
		]);
		await expect(
			field(page, "optionsWithHtmlAllowed").locator(".k-choice-input-label b")
		).toHaveText(["ppl", "soft", "K"]);
	});
});

test("selects and deselects all options in batch mode", async ({ page }) => {
	await tab(page, "Batch");

	const countries = field(page, "countries");
	const selectAll = countries.getByRole("button", {
		exact: true,
		name: "Select all"
	});
	const deselectAll = countries.getByRole("button", { name: "Deselect all" });
	const checked = countries.locator("input:checked");

	await expect(deselectAll).toBeDisabled();

	await selectAll.click();
	await expect(checked).toHaveCount(await countries.locator("input").count());
	await expect(selectAll).toBeDisabled();

	await deselectAll.click();
	await expect(checked).toHaveCount(0);
});

test("hides the batch buttons when disabled", async ({ page }) => {
	await tab(page, "Batch");

	const disabled = field(page, "disabledBatch");

	await expect(disabled.locator("input").first()).toBeDisabled();
	await expect(
		disabled.getByRole("button", { name: /^(Select|Deselect) all$/ })
	).toHaveCount(0);
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "required")).toBeVisible();
		await choices(page, "required").first().click();
		await expect(invalid(page, "required")).toBeHidden();
	});

	test("validates the minimum number of options", async ({ page }) => {
		await expect(invalid(page, "min")).toBeVisible();
		await choices(page, "min").first().click();
		await expect(invalid(page, "min")).toBeHidden();
	});

	test("prevents selecting more than the maximum", async ({ page }) => {
		await expect(choice(page, "max", "c")).toBeEnabled();

		await choices(page, "max").nth(0).click();
		await choices(page, "max").nth(1).click();

		await expect(choice(page, "max", "c")).toBeDisabled();
		await expect(invalid(page, "max")).toBeHidden();

		// deselecting enables the remaining options again
		await choices(page, "max").nth(0).click();
		await expect(choice(page, "max", "c")).toBeEnabled();
	});
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
