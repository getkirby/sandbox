import { cpSync, readdirSync, rmSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { expect, field, heading, test } from "./fixtures.ts";

const source = "environments/lab/content/other/page-sorting";
const target = "public/content/other/page-sorting";

const order = ["Mercury", "Venus", "Earth", "Mars", "Jupiter"];

/**
 * Returns the items of a list in any layout
 */
const items = (page: Page, name: string) =>
	field(page, name).locator(".k-item, tbody tr");

const item = (page: Page, name: string, title: string) =>
	items(page, name).filter({ hasText: title });

const titles = (page: Page, name: string) =>
	field(page, name).locator('.k-item-title, td[data-column-id="title"]');

/**
 * Returns the stored order of the listed pages,
 * e.g. `["1_mercury", "2_venus", …]`
 */
const folders = () =>
	readdirSync(target)
		.filter((folder) => /^\d_/.test(folder))
		.sort();

/**
 * Drags an item by its sort handle onto the position of another item
 */
const drag = async (page: Page, from: Locator, to: Locator) => {
	await from.hover();

	const handle = await from.locator(".k-sort-handle").boundingBox();
	const target = await to.boundingBox();

	await page.mouse.move(
		handle!.x + handle!.width / 2,
		handle!.y + handle!.height / 2
	);
	await page.mouse.down();
	await page.mouse.move(target!.x + 20, target!.y + 5, { steps: 15 });
	await page.mouse.up();
};

/**
 * Waits for the sort request, which moves
 * the page to its new listed position
 */
const sorted = (page: Page) =>
	page.waitForResponse(
		(response) =>
			response.request().method() === "POST" &&
			response.url().includes("/status")
	);

/**
 * Restores the pages after each test, as sorting renames the folders
 */
test.afterEach(() => {
	rmSync(target, { force: true, recursive: true });
	cpSync(source, target, { recursive: true });
});

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/other+page-sorting");
	await expect(heading(page, "Page Sorting", 1)).toBeVisible();
	await expect(items(page, "listed").first()).toBeVisible();
});

test.describe("lists", () => {
	test("shows the listed pages in their order", async ({ page }) => {
		for (const name of ["listed", "notSortable", "cards", "table"]) {
			await expect(titles(page, name)).toHaveText(order);
		}
	});

	test("only shows sort handles for listed, sortable pages", async ({
		page
	}) => {
		for (const name of ["listed", "cards", "table"]) {
			for (const title of ["Mercury", "Venus", "Mars", "Jupiter"]) {
				await expect(
					item(page, name, title).locator(".k-sort-handle")
				).toHaveCount(1);
			}

			// the blueprint of Earth disables sorting
			await expect(
				item(page, name, "Earth").locator(".k-sort-handle")
			).toHaveCount(0);
		}
	});

	test("only sorts listed pages in lists of all statuses", async ({ page }) => {
		await expect(titles(page, "all")).toHaveText([
			...order,
			"Ceres",
			"Pluto",
			"Planet Nine",
			"Vulcan"
		]);
		await expect(field(page, "all").locator(".k-sort-handle")).toHaveCount(4);

		for (const title of ["Ceres", "Pluto", "Planet Nine", "Vulcan"]) {
			await expect(
				item(page, "all", title).locator(".k-sort-handle")
			).toHaveCount(0);
		}
	});

	test("shows no sort handles in unsortable lists", async ({ page }) => {
		for (const name of [
			"unlisted",
			"drafts",
			"notSortable",
			"sortedByTitle",
			"flipped",
			"dated"
		]) {
			await expect(items(page, name).first()).toBeVisible();
			await expect(field(page, name).locator(".k-sort-handle")).toHaveCount(0);
		}
	});

	test("sorts by title or in reverse order", async ({ page }) => {
		await expect(titles(page, "sortedByTitle")).toHaveText([
			"Earth",
			"Jupiter",
			"Mars",
			"Mercury",
			"Venus"
		]);
		await expect(titles(page, "flipped")).toHaveText([...order].reverse());
	});

	test("sorts pages by date", async ({ page }) => {
		await expect(titles(page, "dated")).toHaveText([
			"New Moon",
			"Equinox",
			"Solstice"
		]);
	});

	test("prevents changing the position of locked pages", async ({ page }) => {
		await item(page, "listed", "Earth")
			.getByRole("button", { name: "Options" })
			.click();

		await expect(
			page
				.locator("dialog[open]")
				.last()
				.getByRole("button", { name: "Change position" })
		).toBeDisabled();
	});
});

test.describe("drag and drop", () => {
	test("moves pages up", async ({ page }) => {
		const request = sorted(page);
		await drag(
			page,
			item(page, "listed", "Venus"),
			item(page, "listed", "Mercury")
		);

		const response = await request;
		expect(response.ok()).toBe(true);
		expect(response.url()).toContain("other+page-sorting+venus/status");
		expect(response.request().postDataJSON()).toEqual({
			position: 1,
			status: "listed"
		});

		await expect(titles(page, "listed")).toHaveText([
			"Venus",
			"Mercury",
			"Earth",
			"Mars",
			"Jupiter"
		]);
		expect(folders()).toEqual([
			"1_venus",
			"2_mercury",
			"3_earth",
			"4_mars",
			"5_jupiter"
		]);
	});

	test("moves pages down", async ({ page }) => {
		const request = sorted(page);
		await drag(
			page,
			item(page, "listed", "Mercury"),
			item(page, "listed", "Venus")
		);
		expect((await request).ok()).toBe(true);

		await expect(titles(page, "listed")).toHaveText([
			"Venus",
			"Mercury",
			"Earth",
			"Mars",
			"Jupiter"
		]);
		expect(folders()).toEqual([
			"1_venus",
			"2_mercury",
			"3_earth",
			"4_mars",
			"5_jupiter"
		]);
	});

	test("keeps the new order after reloading", async ({ page }) => {
		const request = sorted(page);
		await drag(
			page,
			item(page, "listed", "Venus"),
			item(page, "listed", "Mercury")
		);
		await request;

		await page.reload();
		for (const name of ["listed", "all", "cards", "table"]) {
			await expect(titles(page, name).nth(0)).toHaveText("Venus");
			await expect(titles(page, name).nth(1)).toHaveText("Mercury");
		}
	});

	for (const name of ["all", "cards", "table"]) {
		test(`sorts in the "${name}" list`, async ({ page }) => {
			const request = sorted(page);
			await drag(page, item(page, name, "Venus"), item(page, name, "Mercury"));
			expect((await request).ok()).toBe(true);

			expect(folders().slice(0, 2)).toEqual(["1_venus", "2_mercury"]);
		});
	}

	test.describe("around unsortable pages", () => {
		// the Panel currently sorts the wrong page, which can be
		// the locked page itself and is then rejected with a 403
		test.use({ ignoreErrors: [/status of 403|cannot be sorted/] });

		test("moves pages below unsortable pages", async ({ page }) => {
			const request = sorted(page);
			await drag(
				page,
				item(page, "listed", "Jupiter"),
				item(page, "listed", "Mars")
			);
			const response = await request;

			// Known bug: the draggable indexes skip the unsortable page,
			// but are used as indexes of the full list, so the wrong page
			// (Mars) is moved and Earth is pushed to position 4.
			// Remove this line once fixed.
			test.fail();

			expect(response.url()).toContain("other+page-sorting+jupiter/status");
			expect(folders()).toEqual([
				"1_mercury",
				"2_venus",
				"3_earth",
				"4_jupiter",
				"5_mars"
			]);
		});

		test("moves pages across unsortable pages", async ({ page }) => {
			const request = sorted(page);
			await drag(
				page,
				item(page, "listed", "Mars"),
				item(page, "listed", "Mercury")
			);
			const response = await request;

			// Known bug: the Panel sends the sort request for Earth
			// instead of Mars, which the server rejects.
			// Remove this line once fixed.
			test.fail();

			expect(response.url()).toContain("other+page-sorting+mars/status");
			expect(response.ok()).toBe(true);
			expect(folders()[0]).toBe("1_mars");
		});

		test("never moves unsortable pages", async ({ page }) => {
			const request = sorted(page);
			await drag(
				page,
				item(page, "listed", "Jupiter"),
				item(page, "listed", "Mars")
			);
			await request;

			// Known bug: see above. Remove this line once fixed.
			test.fail();

			expect(folders()).toContain("3_earth");
		});
	});
});
