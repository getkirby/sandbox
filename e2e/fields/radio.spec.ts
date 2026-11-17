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
	await page.goto("/panel/pages/fields+radio");
});

test("renders the radio fields", async ({ page }) => {
	await expect(heading(page, "Radio", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-radio").first()).toBeVisible();
});

test("selects a single option", async ({ page }) => {
	const label = field(page, "simple").locator(".k-label");

	await expect(choices(page, "simple")).toHaveText(["a", "b", "c"]);

	await choices(page, "simple").nth(1).click();
	await expect(choice(page, "simple", "b")).toBeChecked();
	await expect(label).toHaveAttribute("data-has-diff", "true");

	await choices(page, "simple").nth(2).click();
	await expect(choice(page, "simple", "c")).toBeChecked();
	await expect(choice(page, "simple", "b")).not.toBeChecked();
});

test("arranges options in columns", async ({ page }) => {
	const boxes = await choices(page, "columns").evaluateAll((labels) =>
		labels.map((label) => label.getBoundingClientRect().top)
	);

	expect(new Set(boxes).size).toBe(1);

	const simple = await choices(page, "simple").evaluateAll((labels) =>
		labels.map((label) => label.getBoundingClientRect().top)
	);

	expect(new Set(simple).size).toBe(3);
});

test("disables the options", async ({ page }) => {
	for (const value of ["a", "b", "c"]) {
		await expect(choice(page, "disabled", value)).toBeDisabled();
		await expect(choice(page, "disabledWithValue", value)).toBeDisabled();
	}

	await expect(choice(page, "disabledWithValue", "a")).toBeChecked();
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

	test("shows option infos and icons", async ({ page }) => {
		await expect(
			field(page, "optionsWithInfo").locator(".k-choice-input-label-info")
		).toHaveText([
			"This is the first option",
			"This is the second option",
			"This is the third option"
		]);

		await expect(field(page, "optionsWithIcon").locator(".k-icon")).toHaveCount(
			3
		);
	});

	test("loads options from an API and a query", async ({ page }) => {
		await expect(
			choices(page, "optionsFromApi").locator(".k-choice-input-label-text")
		).toHaveText([
			"Apple",
			"Microsoft",
			"Kirby",
			`<img src="x" onerror="alert('xss')">`
		]);

		await expect(choices(page, "optionsFromQuery")).toHaveText([
			"Benchmarks",
			"Error",
			"Fields"
		]);
	});

	test("escapes or renders HTML in option labels", async ({ page }) => {
		await expect(choices(page, "optionsWithHtmlEscaped")).toHaveText([
			"A<b>ppl</b>e",
			"Micro<b>soft</b>",
			"<b>K</b>irby"
		]);

		await expect(choices(page, "optionsWithHtmlAllowed")).toHaveText([
			"Apple",
			"Microsoft",
			"Kirby"
		]);
		await expect(
			field(page, "optionsWithHtmlAllowed").locator(".k-choice-input-label b")
		).toHaveText(["ppl", "soft", "K"]);
	});
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await choices(page, "required").first().click();
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
