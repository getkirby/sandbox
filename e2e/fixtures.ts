import { test as base, expect, type Page } from "@playwright/test";

type Fixtures = {
	changes: {
		settled: () => Promise<void>;
	};
	errors: string[];
	ignoreErrors: RegExp[];
};

export const test = base.extend<Fixtures>({
	/**
	 * Discards all content changes that the Panel
	 * stored during the test, so that every test
	 * starts with the original lab content
	 */
	changes: [
		async ({ page }, use) => {
			const models = new Map<string, string>();
			let pending = 0;

			const isSave = (url: string) => url.includes("/changes/save");
			const done = (url: string) => isSave(url) === true && pending--;

			page.on("request", (request) => {
				const url = new URL(request.url());
				const match = url.pathname.match(/^\/api\/(.+)\/changes\/save$/);

				if (match !== null) {
					models.set(match[1], url.search);
					pending++;
				}
			});

			page.on("requestfailed", (request) => done(request.url()));
			page.on("requestfinished", (request) => done(request.url()));

			/**
			 * Waits until the Panel has stored all changes
			 * (incl. the trailing call of the throttled save)
			 */
			const settled = async () => {
				await page.waitForTimeout(600);
				await expect.poll(() => pending).toBe(0);
			};

			await use({ settled });

			if (models.size === 0) {
				return;
			}

			await settled();

			for (const [model, query] of models) {
				const response = await page.request.post(
					`/api/${model}/changes/discard${query}`,
					{ headers: { "x-csrf": "dev" } }
				);

				expect(response.ok()).toBe(true);
			}
		},
		{ auto: true }
	],

	/**
	 * Fails every test that logs console errors, throws
	 * page errors or opens unexpected dialogs
	 */
	errors: [
		async ({ ignoreErrors, page }, use) => {
			const errors: string[] = [];

			page.on("console", (message) => {
				if (message.type() === "error") {
					errors.push(`Console error: ${message.text()}`);
				}
			});

			page.on("dialog", async (dialog) => {
				errors.push(`Unexpected dialog: ${dialog.message()}`);
				await dialog.dismiss();
			});

			page.on("pageerror", (error) => {
				errors.push(`Page error: ${error.message}`);
			});

			await use(errors);

			const unexpected = errors.filter(
				(error) => ignoreErrors.some((pattern) => pattern.test(error)) === false
			);

			expect(unexpected).toEqual([]);
		},
		{ auto: true }
	],

	/**
	 * Known errors that should not fail the test,
	 * e.g. `test.use({ ignoreErrors: [/reading 'group'/] })`
	 */
	ignoreErrors: [[], { option: true }]
});

/**
 * Returns the checkbox or radio input of a choice field option
 */
export const choice = (page: Page, name: string, value: string) =>
	field(page, name).locator(`input[value="${value}"]`);

/**
 * Returns the visible labels of all options of a choice field
 */
export const choices = (page: Page, name: string) =>
	field(page, name).locator(".k-choice-input-label");

/**
 * Checks that the `oneHalf*`, `oneThird*` and `oneQuarter*`
 * fields of the current tab share a row per group with
 * equal widths that shrink from halves to quarters
 */
export const expectWidths = async (page: Page) => {
	const groups = [
		["oneHalf1", "oneHalf2"],
		["oneThird1", "oneThird2", "oneThird3"],
		["oneQuarter1", "oneQuarter2", "oneQuarter3", "oneQuarter4"]
	];

	let previous = Infinity;

	for (const names of groups) {
		const boxes = [];

		for (const name of names) {
			const box = await field(page, name).boundingBox();
			expect(box, `${name} is visible`).not.toBeNull();
			boxes.push(box!);
		}

		for (const box of boxes) {
			expect(box.y).toBeCloseTo(boxes[0].y, 0);
			expect(box.width).toBeCloseTo(boxes[0].width, 0);
		}

		expect(boxes[0].width).toBeLessThan(previous);
		previous = boxes[0].width;
	}
};

/**
 * Returns the field wrapper for the given field name
 */
export const field = (page: Page, name: string) =>
	page.locator(`.k-field-name-${name.toLowerCase()}`).first();

export const heading = (page: Page, name: string, level: number) =>
	page.getByRole("main").getByRole("heading", { exact: true, level, name });

/**
 * Selects a tab of the current model view
 */
export const tab = async (page: Page, name: string) => {
	await page
		.getByRole("main")
		.getByRole("navigation")
		.getByRole("link", { exact: true, name })
		.click();
};

/**
 * Returns the text input of the given field name
 * (labels are unreliable as the accessible name
 * changes with the required and invalid markers)
 */
export const textbox = (page: Page, name: string) =>
	field(page, name).getByRole("textbox").first();

export { expect };
