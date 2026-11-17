import { existsSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	field,
	heading,
	restoreAfterEach,
	test,
	viewButton
} from "./fixtures.ts";

/**
 * Restores the pages after each test, as status changes
 * move the page folders
 */
restoreAfterEach("content/other/page-status");

type Status = {
	icon: string;
	label: string;
	theme: string;
};

/**
 * Expected status buttons per list (listed, unlisted, draft)
 */
const expected: Record<string, Status[]> = {
	default: [
		{ icon: "status-listed", label: "Public", theme: "positive-icon" },
		{ icon: "status-unlisted", label: "Unlisted", theme: "info-icon" },
		{ icon: "status-draft", label: "Draft", theme: "negative-icon" }
	],
	emoji: [
		{ icon: "🚀", label: "Published", theme: "positive-icon" },
		{ icon: "👀", label: "In review", theme: "info-icon" },
		{ icon: "💡", label: "Idea", theme: "negative-icon" }
	],
	fallback: [
		// the blueprint has no listed status, so the defaults are used
		{ icon: "status-listed", label: "Public", theme: "positive-icon" },
		{ icon: "preview", label: "In review", theme: "purple-icon" },
		{ icon: "💡", label: "Idea", theme: "negative-icon" }
	],
	icons: [
		{ icon: "globe", label: "Public", theme: "positive-icon" },
		{ icon: "hidden", label: "Unlisted", theme: "info-icon" },
		{ icon: "edit", label: "Draft", theme: "negative-icon" }
	],
	labels: [
		{ icon: "status-listed", label: "Published", theme: "positive-icon" },
		{ icon: "status-unlisted", label: "In review", theme: "info-icon" },
		{ icon: "status-draft", label: "Idea", theme: "negative-icon" }
	],
	themes: [
		{ icon: "status-listed", label: "Public", theme: "aqua-icon" },
		{ icon: "status-unlisted", label: "Unlisted", theme: "purple-icon" },
		{ icon: "status-draft", label: "Draft", theme: "notice-icon" }
	],
	two: [
		{ icon: "globe", label: "Public", theme: "positive-icon" },
		{ icon: "status-draft", label: "Draft", theme: "negative-icon" }
	],
	workflow: [
		{ icon: "globe", label: "Published", theme: "positive-icon" },
		{ icon: "preview", label: "In review", theme: "purple-icon" },
		{ icon: "bolt", label: "Idea", theme: "notice-icon" }
	]
};

/**
 * Selects a status in the status dialog
 */
const check = (page: Page, status: string) =>
	dialog(page).locator(`input[value="${status}"]`).check({ force: true });

/**
 * Checks if a page folder exists, e.g. `exists("_drafts/default-draft")`
 */
const exists = (path: string) =>
	existsSync(`public/content/other/page-status/${path}`);

const expectStatus = async (page: Page, name: string, statuses: Status[]) => {
	const buttons = statusButtons(page, name);
	await expect(buttons).toHaveCount(statuses.length);

	for (const [index, status] of statuses.entries()) {
		const button = buttons.nth(index);

		await expect(button).toHaveAccessibleName(`Status: ${status.label}`);
		await expect(button).toHaveAttribute("data-theme", status.theme);

		if (/^\p{Emoji}/u.test(status.icon) === true) {
			await expect(button.locator('[data-type="emoji"]')).toHaveText(
				status.icon
			);
		} else {
			await expect(button.locator(".k-icon")).toHaveAttribute(
				"data-type",
				status.icon
			);
		}
	}
};

const options = (page: Page) =>
	dialog(page).locator(".k-field-name-status .k-choice-input-label");

const statusButtons = (page: Page, name: string) =>
	field(page, name).getByRole("button", { name: /^Status: / });

/**
 * Panel URL of the lab page or one of its subpages
 */
const url = (slug?: string) =>
	["/panel/pages/other+page-status", slug].filter(Boolean).join("+");

test.describe("lists", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url());
		await expect(heading(page, "Page Status", 1)).toBeVisible();
	});

	for (const [name, statuses] of Object.entries(expected)) {
		test(`shows the status of "${name}" pages`, async ({ page }) => {
			await expectStatus(page, name, statuses);
		});
	}

	test("shows the status in cards and tables", async ({ page }) => {
		await expectStatus(page, "workflowCards", expected.workflow);
		await expectStatus(page, "workflowTable", expected.workflow);
	});
});

test.describe("page view", () => {
	test("shows the status button", async ({ page }) => {
		await page.goto(url("workflow-listed"));

		const button = viewButton(page, "Published");

		await expect(button).toHaveAttribute("title", "Status: Published");
		await expect(button).toHaveAttribute("data-theme", "positive-icon");
		await expect(button.locator(".k-icon")).toHaveAttribute(
			"data-type",
			"globe"
		);
	});

	test("shows custom labels and texts in the dialog", async ({ page }) => {
		await page.goto(url("workflow-unlisted"));
		await viewButton(page, "In review").click();

		await expect(
			options(page).locator(".k-choice-input-label-text")
		).toHaveText(["Idea", "In review", "Published"]);
		await expect(
			options(page).locator(".k-choice-input-label-info")
		).toHaveText([
			"Only an idea so far",
			"Waiting for an editor",
			"Visible for everyone"
		]);
		await expect(
			dialog(page).locator('.k-field-name-status input[value="unlisted"]')
		).toBeChecked();
	});

	test("only offers the statuses of the blueprint", async ({ page }) => {
		await page.goto(url("two-draft"));
		await viewButton(page, "Draft").click();

		await expect(
			options(page).locator(".k-choice-input-label-text")
		).toHaveText(["Draft", "Public"]);
	});
});

test("labels the fallback status in the dialog", async ({ page }) => {
	// the page is listed, but the blueprint has no listed status
	await page.goto(url("fallback-listed"));
	await viewButton(page, "Public").click();

	const labels = options(page).locator(".k-choice-input-label-text");
	await expect(labels).toHaveCount(3);
	await expect(labels.nth(0)).toHaveText("Idea");
	await expect(labels.nth(1)).toHaveText("In review");

	// Known bug: the current status is not part of the blueprint's
	// statuses, so the radio field labels it as "[unknown]" instead of
	// using the fallback label of the status button. Remove this line once fixed.
	test.fail();

	await expect(labels.nth(2)).toHaveText("Public", { timeout: 1000 });
});

test.describe("changing the status", () => {
	test("publishes drafts at a position", async ({ page }) => {
		await page.goto(url("default-draft"));
		await viewButton(page, "Draft").click();

		await check(page, "listed");

		// listed pages need a position
		const position = dialog(page).locator(".k-field-name-position select");
		await expect(position).toBeVisible();
		await position.selectOption("1");

		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(viewButton(page, "Public")).toBeVisible();
		expect(exists("1_default-draft")).toBe(true);
		expect(exists("_drafts/default-draft")).toBe(false);
	});

	test("unlists listed pages", async ({ page }) => {
		await page.goto(url("default-listed"));
		await viewButton(page, "Public").click();

		await check(page, "unlisted");
		await expect(dialog(page).locator(".k-field-name-position")).toHaveCount(0);
		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(viewButton(page, "Unlisted")).toBeVisible();
		expect(exists("default-listed")).toBe(true);
		expect(exists("1_default-listed")).toBe(false);
	});

	test("changes the status from the list", async ({ page }) => {
		await page.goto(url());

		await statusButtons(page, "labels").nth(1).click();
		await check(page, "draft");
		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(statusButtons(page, "labels")).toHaveCount(3);
		await expect(
			field(page, "labels").getByRole("button", { name: "Status: Idea" })
		).toHaveCount(2);
		expect(exists("_drafts/labels-unlisted")).toBe(true);
	});

	test("cancels the status change", async ({ page }) => {
		await page.goto(url("default-unlisted"));
		await viewButton(page, "Unlisted").click();

		await check(page, "draft");
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(viewButton(page, "Unlisted")).toBeVisible();
		expect(exists("default-unlisted")).toBe(true);
	});
});
