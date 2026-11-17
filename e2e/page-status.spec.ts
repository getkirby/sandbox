import { cpSync, existsSync, rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, field, heading, test } from "./fixtures.ts";

const source = "environments/lab/content/other/page-status";
const target = "public/content/other/page-status";

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

const statusButtons = (page: Page, name: string) =>
	field(page, name).getByRole("button", { name: /^Status: / });

const dialog = (page: Page) => page.locator(".k-dialog");

const options = (page: Page) =>
	dialog(page).locator(".k-field-name-status .k-choice-input-label");

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

/**
 * Restores the pages after each test, as status changes
 * move the page folders
 */
test.afterEach(() => {
	rmSync(target, { force: true, recursive: true });
	cpSync(source, target, { recursive: true });
});

test.describe("lists", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/panel/pages/other+page-status");
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
		await page.goto("/panel/pages/other+page-status+workflow-listed");

		const button = page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Published" });

		await expect(button).toHaveAttribute("title", "Status: Published");
		await expect(button).toHaveAttribute("data-theme", "positive-icon");
		await expect(button.locator(".k-icon")).toHaveAttribute(
			"data-type",
			"globe"
		);
	});

	test("shows custom labels and texts in the dialog", async ({ page }) => {
		await page.goto("/panel/pages/other+page-status+workflow-unlisted");
		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "In review" })
			.click();

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
		await page.goto("/panel/pages/other+page-status+two-draft");
		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Draft" })
			.click();

		await expect(
			options(page).locator(".k-choice-input-label-text")
		).toHaveText(["Draft", "Public"]);
	});
});

test("labels the fallback status in the dialog", async ({ page }) => {
	// the page is listed, but the blueprint has no listed status
	await page.goto("/panel/pages/other+page-status+fallback-listed");
	await page
		.locator(".k-view-buttons")
		.getByRole("button", { name: "Public" })
		.click();

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
		await page.goto("/panel/pages/other+page-status+default-draft");
		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Draft" })
			.click();

		await dialog(page).locator('input[value="listed"]').check({ force: true });

		// listed pages need a position
		const position = dialog(page).locator(".k-field-name-position select");
		await expect(position).toBeVisible();
		await position.selectOption("1");

		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(
			page.locator(".k-view-buttons").getByRole("button", { name: "Public" })
		).toBeVisible();
		expect(existsSync(`${target}/1_default-draft`)).toBe(true);
		expect(existsSync(`${target}/_drafts/default-draft`)).toBe(false);
	});

	test("unlists listed pages", async ({ page }) => {
		await page.goto("/panel/pages/other+page-status+default-listed");
		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Public" })
			.click();

		await dialog(page)
			.locator('input[value="unlisted"]')
			.check({ force: true });
		await expect(dialog(page).locator(".k-field-name-position")).toHaveCount(0);
		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(
			page.locator(".k-view-buttons").getByRole("button", { name: "Unlisted" })
		).toBeVisible();
		expect(existsSync(`${target}/default-listed`)).toBe(true);
		expect(existsSync(`${target}/1_default-listed`)).toBe(false);
	});

	test("changes the status from the list", async ({ page }) => {
		await page.goto("/panel/pages/other+page-status");

		await statusButtons(page, "labels").nth(1).click();
		await dialog(page).locator('input[value="draft"]').check({ force: true });
		await dialog(page).getByRole("button", { name: "Change" }).click();
		await expect(dialog(page)).toBeHidden();

		await expect(statusButtons(page, "labels")).toHaveCount(3);
		await expect(
			field(page, "labels").getByRole("button", { name: "Status: Idea" })
		).toHaveCount(2);
		expect(existsSync(`${target}/_drafts/labels-unlisted`)).toBe(true);
	});

	test("cancels the status change", async ({ page }) => {
		await page.goto("/panel/pages/other+page-status+default-unlisted");
		await page
			.locator(".k-view-buttons")
			.getByRole("button", { name: "Unlisted" })
			.click();

		await dialog(page).locator('input[value="draft"]').check({ force: true });
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(
			page.locator(".k-view-buttons").getByRole("button", { name: "Unlisted" })
		).toBeVisible();
		expect(existsSync(`${target}/default-unlisted`)).toBe(true);
	});
});
