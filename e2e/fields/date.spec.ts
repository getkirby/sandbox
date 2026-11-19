import type { Page } from "@playwright/test";
import {
	dropdown,
	expect,
	field,
	heading,
	invalid,
	tab,
	test
} from "../fixtures.ts";

const date = (page: Page, name: string) =>
	field(page, name).locator("input.k-date-input");

const enter = async (page: Page, name: string, value: string) => {
	await date(page, name).fill(value);
	await date(page, name).press("Tab");
};

const time = (page: Page, name: string) =>
	field(page, name).getByRole("textbox").nth(1);

const today = () => {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+date");
});

test("renders the date fields", async ({ page }) => {
	await expect(heading(page, "Date", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-date").first()).toBeVisible();
});

test("stores typed dates", async ({ changes, page }) => {
	await expect(date(page, "date")).toHaveAttribute("placeholder", today());

	await enter(page, "date", "2021-03-05");
	await expect(date(page, "date")).toHaveValue("2021-03-05");
	await expect(field(page, "date").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);

	expect((await changes.saved()).date).toBe("2021-03-05 00:00:00");
});

test("picks dates from the calendar", async ({ page }) => {
	await enter(page, "date", "2021-03-05");
	await field(page, "date")
		.getByRole("button", { name: "Select a date" })
		.click();

	const calendar = dropdown(page);
	await expect(calendar.getByRole("combobox", { name: "Month" })).toHaveValue(
		"2"
	);
	await expect(calendar.getByRole("combobox", { name: "Year" })).toHaveValue(
		"2021"
	);

	await calendar.getByRole("button", { exact: true, name: "15" }).click();
	await expect(date(page, "date")).toHaveValue("2021-03-15");
});

test("shows icons, before and after texts", async ({ page }) => {
	await expect(
		field(page, "dateIcon").locator('.k-input-icon [data-type="edit"]')
	).toBeVisible();
	await expect(field(page, "dateBefore").locator(".k-input-before")).toHaveText(
		"Published"
	);
	await expect(field(page, "dateAfter").locator(".k-input-after")).toHaveText(
		"Published"
	);
	await expect(field(page, "dateHelp").locator(".k-field-help")).toHaveText(
		"Some help text …"
	);
});

test("disables the input and the calendar", async ({ page }) => {
	await expect(date(page, "dateDisabled")).toBeDisabled();
	await expect(date(page, "dateDisabledWithValue")).toBeDisabled();
	await expect(date(page, "dateDisabledWithValue")).toHaveValue("2025-07-01");
	await expect(
		field(page, "dateDisabledWithValue").getByRole("button")
	).toHaveCount(0);
});

test("hides the calendar dropdown", async ({ page }) => {
	await expect(date(page, "dateDisabledDropdown")).toBeEnabled();
	await expect(
		field(page, "dateDisabledDropdown").getByRole("button", {
			name: "Select a date"
		})
	).toHaveCount(0);
});

test.describe("date & time", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Date time");
	});

	test("stores date and time", async ({ changes, page }) => {
		await enter(page, "time", "2021-03-05");
		await time(page, "time").fill("14:30");
		await time(page, "time").press("Tab");

		expect((await changes.saved()).time).toBe("2021-03-05 14:30:00");
	});

	test("shows the disabled value", async ({ page }) => {
		await expect(date(page, "timeDisabledWithValue")).toHaveValue("2025-07-01");
		await expect(time(page, "timeDisabledWithValue")).toHaveValue("21:15");
		await expect(time(page, "timeDisabledWithValue")).toBeDisabled();
	});

	test("hides the calendar dropdown", async ({ page }) => {
		await expect(date(page, "timeDisabledDropdowns")).toBeVisible();
		await expect(
			field(page, "timeDisabledDropdowns").getByRole("button", {
				name: "Select a date"
			})
		).toHaveCount(0);
	});

	test("hides the times dropdown", async ({ page }) => {
		await expect(time(page, "timeDisabledDropdowns")).toBeVisible();
		await expect(
			field(page, "timeDisabledDropdowns").getByRole("button")
		).toHaveCount(0, { timeout: 1000 });
	});

	test("labels the time dropdown button", async ({ page }) => {
		await expect(
			field(page, "time").getByRole("button").nth(1)
		).toHaveAccessibleName("Select a time");
	});
});

test.describe("validation", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Validation");
	});

	test("validates required fields", async ({ page }) => {
		await expect(invalid(page, "dateRequired")).toBeVisible();
		await enter(page, "dateRequired", "2026-05-01");
		await expect(invalid(page, "dateRequired")).toBeHidden();
	});

	test("validates the minimum and maximum", async ({ page }) => {
		await enter(page, "dateMin", "2025-12-31");
		await expect(invalid(page, "dateMin")).toBeVisible();
		await enter(page, "dateMin", "2026-01-01");
		await expect(invalid(page, "dateMin")).toBeHidden();

		await enter(page, "dateMax", "2028-01-02");
		await expect(invalid(page, "dateMax")).toBeVisible();
		await enter(page, "dateMax", "2028-01-01");
		await expect(invalid(page, "dateMax")).toBeHidden();

		await enter(page, "dateMinMax", "2028-02-02");
		await expect(invalid(page, "dateMinMax")).toBeVisible();
		await enter(page, "dateMinMax", "2027-06-15");
		await expect(invalid(page, "dateMinMax")).toBeHidden();
	});

	test("uses the minimum as placeholder", async ({ page }) => {
		await expect(date(page, "dateMinFuture")).toHaveAttribute(
			"placeholder",
			"2030-01-01"
		);
	});

	test("validates boundaries with time", async ({ page }) => {
		await enter(page, "dateTimeMinMax", "2022-01-15");
		await expect(invalid(page, "dateTimeMinMax")).toBeHidden();
		await enter(page, "dateTimeMinMax", "2022-02-02");
		await expect(invalid(page, "dateTimeMinMax")).toBeVisible();
	});
});

test.describe("display", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Display");
	});

	test("formats dates for display", async ({ changes, page }) => {
		await enter(page, "displayEurope", "5.3.2021");
		await expect(date(page, "displayEurope")).toHaveValue("05.03.2021");

		await enter(page, "displayUs", "3/5/2021");
		await expect(date(page, "displayUs")).toHaveValue("03/05/2021");

		await enter(page, "displayMonth", "5. March 2021");
		await expect(date(page, "displayMonth")).toHaveValue("05. March 2021");

		const saved = await changes.saved();
		expect(saved.displayeurope).toBe("2021-03-05 00:00:00");
		expect(saved.displayus).toBe("2021-03-05 00:00:00");
		expect(saved.displaymonth).toBe("2021-03-05 00:00:00");
	});

	test("prints escaped display text as is", async ({ page }) => {
		await enter(page, "displayEscaped", "5. March 2021");
		await expect(date(page, "displayEscaped")).toHaveValue("Am 5. March 2021");
	});

	test("uses the 12-hour notation", async ({ changes, page }) => {
		await enter(page, "displayAmPm", "2021-03-05");
		await time(page, "displayAmPm").fill("5:15 pm");
		await time(page, "displayAmPm").press("Tab");

		await expect(time(page, "displayAmPm")).toHaveValue("05:15 pm");
		expect((await changes.saved()).displayampm).toBe("2021-03-05 17:15:00");
	});
});

test.describe("parsing", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Parsing");
	});

	test("parses input in the field's own format", async ({ changes, page }) => {
		await enter(page, "parseMonthFirst", "05-03-2021");
		await enter(page, "parseDayFirst", "05-03-2021");

		const saved = await changes.saved();
		expect(saved.parsemonthfirst).toBe("2021-05-03 00:00:00");
		expect(saved.parsedayfirst).toBe("2021-03-05 00:00:00");
	});

	test("parses free input", async ({ page }) => {
		for (const [input, output] of [
			["5/3/21", "05.03.2021"],
			["02032024", "02.03.2024"]
		]) {
			await enter(page, "parseFree", input);
			await expect(date(page, "parseFree")).toHaveValue(output);
		}
	});

	test("keeps invalid input and marks the field", async ({ page }) => {
		await enter(page, "parseInvalid", "nonsense");
		await expect(date(page, "parseInvalid")).toHaveValue("nonsense");
		await expect(invalid(page, "parseInvalid")).toBeVisible();
	});

	test("fills in today with the arrow keys", async ({ page }) => {
		const [year, month, day] = today().split("-");

		await date(page, "parseEmpty").press("ArrowUp");
		await expect(date(page, "parseEmpty")).toHaveValue(
			`${month}/${day}/${year}`
		);
	});
});

test("rounds times to the default 5-minute step", async ({ changes, page }) => {
	await tab(page, "Date time");
	await enter(page, "time", "2021-03-05");
	await time(page, "time").fill("14:32");
	await time(page, "time").press("Tab");

	await expect(time(page, "time")).toHaveValue("14:30");
	expect((await changes.saved()).time).toBe("2021-03-05 14:30:00");
});

test.describe("steps", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Steps");
	});

	test("steps by month and year", async ({ changes, page }) => {
		await enter(page, "stepMonth", "2021-03-05");
		await enter(page, "stepYear", "2021-03-05");

		const saved = await changes.saved();
		expect(saved.stepmonth).toBe("2021-03-01 00:00:00");
		expect(saved.stepyear).toBe("2021-01-01 00:00:00");
	});
});
