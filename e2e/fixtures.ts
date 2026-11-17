import { cpSync, readdirSync, readFileSync, rmSync } from "node:fs";
import {
	type APIRequestContext,
	test as base,
	expect,
	type Page
} from "@playwright/test";

type Changes = {
	saved: () => Promise<Record<string, unknown>>;
	settled: () => Promise<void>;
	store: (
		model: string,
		values: Record<string, unknown>,
		options?: { language?: string; request?: APIRequestContext }
	) => Promise<void>;
};

type Fixtures = {
	changes: Changes;
	errors: string[];
	ignoreErrors: RegExp[];
	session: (email?: string) => Promise<APIRequestContext>;
};

/**
 * Headers for API requests in the sandbox (csrf mode `dev`)
 */
export const csrf = { "x-csrf": "dev" };

export const test = base.extend<Fixtures>({
	/**
	 * Discards all content changes that the Panel stored during
	 * the test or that the test stored via `changes.store()`,
	 * so that every test starts with the original lab content
	 */
	changes: [
		// depends on `session` so that the request contexts of other
		// users are still available when their changes are discarded
		async ({ page, session: _session }, use) => {
			const models = new Map<string, APIRequestContext>();
			let pending = 0;
			let values: Record<string, unknown> = {};

			const isSave = (url: string) => url.includes("/changes/save");
			const done = (url: string) => isSave(url) === true && pending--;

			page.on("request", (request) => {
				const url = new URL(request.url());
				const match = url.pathname.match(/^\/api\/(.+)\/changes\/save$/);

				if (match !== null) {
					models.set(`${match[1]}${url.search}`, page.request);
					values = { ...values, ...request.postDataJSON() };
					pending++;
				}
			});

			page.on("requestfailed", (request) => done(request.url()));
			page.on("requestfinished", (request) => done(request.url()));

			/**
			 * Returns the latest stored values of all fields
			 * (keys are the lowercase field names)
			 */
			const saved = async () => {
				await settled();
				return values;
			};

			/**
			 * Waits until the Panel has stored all changes
			 * (incl. the trailing call of the throttled save)
			 */
			const settled = async () => {
				await page.waitForTimeout(600);
				await expect.poll(() => pending).toBe(0);
			};

			/**
			 * Stores unsaved changes for a model via the API,
			 * e.g. `store("pages/fields+text", { text: "Changed" })`.
			 * Pass the `request` of another user's `session()`
			 * to store the changes as that user.
			 */
			const store: Changes["store"] = async (
				model,
				data,
				{ language = "en", request = page.request } = {}
			) => {
				const query = `?language=${language}`;
				const response = await request.post(
					`/api/${model}/changes/save${query}`,
					{ data, headers: csrf }
				);

				expect(response.ok()).toBe(true);
				models.set(`${model}${query}`, request);
			};

			await use({ saved, settled, store });

			if (models.size === 0) {
				return;
			}

			await settled();

			for (const [model, request] of models) {
				const [path, query = ""] = model.split("?");
				const response = await request.post(
					`/api/${path}/changes/discard?${query}`,
					{ headers: csrf }
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
	 * (combine multiple patterns into one regex, as an array
	 * with two entries would be read as `[value, options]`)
	 */
	ignoreErrors: [[], { option: true }],

	/**
	 * Creates an API request context with its own session,
	 * signed in as the given user (or signed out without email).
	 * All contexts are disposed after the test.
	 *
	 * Request contexts created with `playwright.request.newContext()`
	 * inherit the admin's storage state of the project, so signing in
	 * there would switch the shared admin session to the other user.
	 */
	session: async ({ playwright }, use) => {
		const contexts: APIRequestContext[] = [];

		await use(async (email) => {
			const context = await playwright.request.newContext({
				extraHTTPHeaders: csrf,
				storageState: { cookies: [], origins: [] }
			});

			contexts.push(context);

			if (email !== undefined) {
				const response = await context.get(`/env/auth/${email}`);
				expect(response.ok()).toBe(true);
			}

			return context;
		});

		for (const context of contexts) {
			await context.dispose();
		}
	}
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
 * Returns the Panel dialog (form dialogs, confirmations, pickers, …)
 */
export const dialog = (page: Page) => page.locator(".k-dialog");

/**
 * Returns the "Discard" button of the current model view
 */
export const discard = (page: Page) =>
	page.getByRole("main").getByRole("button", { exact: true, name: "Discard" });

/**
 * Returns the Panel drawer (structure entries, objects, blocks, …)
 */
export const drawer = (page: Page) => page.locator(".k-drawer");

/**
 * Returns the most recently opened dropdown
 * (dropdowns are rendered as native `<dialog>` elements)
 */
export const dropdown = (page: Page) => page.locator("dialog[open]").last();

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
 * Returns the invalid marker in the label of a field
 */
export const invalid = (page: Page, name: string) =>
	field(page, name).locator(".k-label-invalid");

/**
 * Runs the tests of the current describe block in their own
 * session, signed in as the given user. Tests that change
 * passwords or switch accounts renew the session token, which
 * would otherwise sign out the session shared by all tests.
 */
export const isolatedSession = (email: string) => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test.beforeEach(async ({ page }) => {
		await page.goto(`/env/auth/${email}?panel`);
	});
};

/**
 * Returns the item of a collection (e.g. in the users
 * or languages view) by the heading of the item
 */
export const item = (page: Page, name: string) =>
	page
		.locator(".k-item")
		.filter({ has: page.getByRole("heading", { exact: true, name }) });

/**
 * Opens the changes dialog from the menu
 * and returns the dialog
 */
export const openChanges = async (page: Page) => {
	await page
		.getByRole("navigation", { name: "Menu" })
		.getByRole("button", { name: "Changes" })
		.click();

	const changes = page.locator(".k-changes-dialog");
	await expect(changes).toBeVisible();

	return changes;
};

/**
 * Opens the settings dropdown of the current
 * model view and returns the dropdown
 */
export const openSettings = async (page: Page) => {
	await viewButton(page, "Settings").click();
	await expect(dropdown(page)).toBeVisible();

	return dropdown(page);
};

/**
 * Picks an option from the settings dropdown of
 * the current model view and waits for its dialog
 */
export const openSettingsDialog = async (page: Page, option: string) => {
	const settings = await openSettings(page);
	await settings.getByRole("button", { name: option }).click();
	await expect(dialog(page)).toBeVisible();
};

/**
 * Reads a content file of the installed lab and returns
 * its fields with lowercase keys, e.g. `{ title: "Lab" }`
 *
 * @param file Path relative to `public/content`
 */
export const readContent = (file: string): Record<string, string> => {
	const content: Record<string, string> = {};
	const text = readFileSync(`public/content/${file}`, "utf8");

	for (const entry of text.split(/\n----\n/)) {
		const match = entry.trim().match(/^([^:]+):\s*([\s\S]*)$/);

		if (match !== null) {
			content[match[1].toLowerCase()] = match[2].trim();
		}
	}

	return content;
};

/**
 * Restores a folder of the installed lab from the lab environment.
 * With a filter, only the matching entries of the folder are
 * removed and copied back, all other entries stay untouched.
 *
 * @param path Path relative to `public`, e.g. `content/other/when`
 */
export const restore = (path: string, filter?: (entry: string) => boolean) => {
	const source = `environments/lab/${path}`;
	const target = `public/${path}`;

	if (filter === undefined) {
		rmSync(target, { force: true, recursive: true });
		cpSync(source, target, { recursive: true });
		return;
	}

	for (const entry of readdirSync(target).filter(filter)) {
		rmSync(`${target}/${entry}`, { force: true, recursive: true });
	}

	for (const entry of readdirSync(source).filter(filter)) {
		cpSync(`${source}/${entry}`, `${target}/${entry}`, { recursive: true });
	}
};

/**
 * Restores a folder of the installed lab after each test
 * of the current file or describe block (see `restore()`)
 */
export const restoreAfterEach = (
	path: string,
	filter?: (entry: string) => boolean
) => {
	test.afterEach(() => restore(path, filter));
};

/**
 * Returns the "Save" button of the current model view
 */
export const save = (page: Page) =>
	page.getByRole("main").getByRole("button", { exact: true, name: "Save" });

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

/**
 * Returns the titles of all items in a collection field or section
 */
export const titles = (page: Page, name: string) =>
	field(page, name).locator(".k-item-title");

/**
 * Returns a button of the current model view's header
 */
export const viewButton = (page: Page, name: string) =>
	page.locator(".k-view-buttons").getByRole("button", { name });

export { expect };
