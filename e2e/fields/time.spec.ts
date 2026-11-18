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

const enter = async (page: Page, name: string, value: string) => {
	await input(page, name).fill(value);
	await input(page, name).press("Tab");
};

const input = (page: Page, name: string) =>
	field(page, name).locator("input.k-time-input");

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/fields+time");
});

test("renders the time fields", async ({ page }) => {
	await expect(heading(page, "Time", 1)).toBeVisible();
	await expect(page.locator(".k-field-type-time").first()).toBeVisible();
});

test("stores typed times", async ({ changes, page }) => {
	await enter(page, "time", "14:30");
	await expect(input(page, "time")).toHaveValue("14:30");
	await expect(field(page, "time").locator(".k-label")).toHaveAttribute(
		"data-has-diff",
		"true"
	);

	expect((await changes.saved()).time).toBe("14:30:00");
});

test("rounds times to the default 5-minute step", async ({ page }) => {
	await enter(page, "time", "14:32");
	await expect(input(page, "time")).toHaveValue("14:30");
});

test("picks times from the dropdown", async ({ page }) => {
	await field(page, "time").getByRole("button").click();

	const times = dropdown(page);
	await expect(times.getByRole("heading", { name: "Day" })).toBeVisible();
	await expect(times.getByRole("heading", { name: "Night" })).toBeVisible();

	await times.getByRole("button", { name: "09:00" }).click();
	await expect(input(page, "time")).toHaveValue("09:00");
});

test("shows icons, before and after texts", async ({ page }) => {
	await expect(
		field(page, "icon").locator('.k-input-icon [data-type="heart"]')
	).toBeVisible();

	const both = field(page, "beforeAndAfter");
	await expect(both.locator(".k-input-before")).toHaveText("Published");
	await expect(both.locator(".k-input-after")).toHaveText("Date");
	await expect(field(page, "help").locator(".k-field-help")).toHaveText(
		"Some help text …"
	);
});

test("disables the input and the dropdown", async ({ page }) => {
	await expect(input(page, "disabled")).toBeDisabled();
	await expect(input(page, "disabledWithValue")).toBeDisabled();
	await expect(input(page, "disabledWithValue")).toHaveValue("21:15");
	await expect(
		field(page, "disabledWithValue").getByRole("button")
	).toBeDisabled();
});

test("hides the times dropdown", async ({ page }) => {
	// Known bug: the `times` option is not passed on by the backend,
	// so `times: false` has no effect. Remove this line once fixed.
	test.fail();

	await expect(input(page, "disabledDropdown")).toBeEnabled();
	await expect(field(page, "disabledDropdown").getByRole("button")).toHaveCount(
		0,
		{ timeout: 1000 }
	);
});

test("labels the dropdown button", async ({ page }) => {
	await expect(field(page, "time").getByRole("button")).toHaveAccessibleName(
		"Select a time"
	);
});

test.describe("display", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Display");
	});

	test("uses the 12-hour notation", async ({ changes, page }) => {
		await enter(page, "displayAmPm", "5:15 pm");
		await expect(input(page, "displayAmPm")).toHaveValue("05:15 pm");
		expect((await changes.saved()).displayampm).toBe("17:15:00");
	});

	test("shows seconds", async ({ changes, page }) => {
		await enter(page, "displaySeconds", "14:30:15");
		await expect(input(page, "displaySeconds")).toHaveValue("14:30:15");
		expect((await changes.saved()).displayseconds).toBe("14:30:15");
	});

	test("prints escaped display text as is", async ({ changes, page }) => {
		await enter(page, "displayEscaped", "14:30");
		await expect(input(page, "displayEscaped")).toHaveValue("14h30");
		expect((await changes.saved()).displayescaped).toBe("14:30:00");
	});

	test("handles hours of variable width", async ({ page }) => {
		await enter(page, "displayVariableWidth", "9:00 am");
		await expect(input(page, "displayVariableWidth")).toHaveValue("9:00 am");
		await enter(page, "displayVariableWidth", "11:00 am");
		await expect(input(page, "displayVariableWidth")).toHaveValue("11:00 am");
	});
});

test.describe("parsing", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Parsing");
	});

	test("parses free input", async ({ page }) => {
		for (const [value, output] of [
			["9", "09:00"],
			["5:12", "05:10"],
			["1235", "12:35"]
		]) {
			await enter(page, "parseFree", value);
			await expect(input(page, "parseFree")).toHaveValue(output);
		}
	});

	test("toggles the meridiem with the arrow keys", async ({ page }) => {
		await enter(page, "parseMeridiem", "5:15 pm");
		await expect(input(page, "parseMeridiem")).toHaveValue("5:15 pm");

		// select the meridiem and step it
		await input(page, "parseMeridiem").click();
		await input(page, "parseMeridiem").press("End");
		await input(page, "parseMeridiem").press("ArrowUp");
		await expect(input(page, "parseMeridiem")).toHaveValue("5:15 am");
	});

	test("keeps invalid input and marks the field", async ({ page }) => {
		await enter(page, "parseInvalid", "25:61");
		await expect(input(page, "parseInvalid")).toHaveValue("25:61");
		await expect(invalid(page, "parseInvalid")).toBeVisible();
	});

	test("fills in the rounded current time with the arrow keys", async ({
		page
	}) => {
		await input(page, "parseEmpty").press("ArrowUp");
		await expect(input(page, "parseEmpty")).toHaveValue(
			/^\d{2}:(00|15|30|45)$/
		);
	});
});

test.describe("steps", () => {
	test.beforeEach(async ({ page }) => {
		await tab(page, "Step");
	});

	test("steps by the configured unit", async ({ page }) => {
		await enter(page, "minute", "10:00");
		await input(page, "minute").press("End");
		await input(page, "minute").press("ArrowUp");
		await expect(input(page, "minute")).toHaveValue("10:05");

		await enter(page, "hour", "10:20");
		await expect(input(page, "hour")).toHaveValue("10:00");
	});
});

test("validates required fields", async ({ page }) => {
	await tab(page, "Validation");

	await expect(invalid(page, "required")).toBeVisible();
	await enter(page, "required", "10:00");
	await expect(invalid(page, "required")).toBeHidden();
});

test("aligns fields by width", async ({ page }) => {
	await tab(page, "Widths");
	await expectWidths(page);
});
