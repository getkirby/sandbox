import { existsSync, readdirSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	field,
	heading,
	invalid,
	readContent,
	restoreAfterEach,
	test,
	titles
} from "./fixtures.ts";

const scenario = "other/page-creation";
const source = `environments/lab/content/${scenario}`;
const target = `public/content/${scenario}`;
const url = "/panel/pages/other+page-creation";

/**
 * Restores the content of the lab page after each test,
 * which removes all pages created by the test
 */
restoreAfterEach(`content/${scenario}`);

type Stored = {
	content: Record<string, string>;
	status: "draft" | "listed" | "unlisted";
	template: string;
};

const add = (page: Page, name: string) =>
	field(page, name).locator("header").getByRole("button", { name: "Add" });

const create = (page: Page) =>
	dialog(page).getByRole("button", { name: /^Create as/ });

const input = (page: Page, label: string | RegExp) =>
	dialog(page)
		.locator(".k-field")
		.filter({ has: page.locator(".k-label-text", { hasText: label }) })
		.getByRole("textbox");

/**
 * Reads the stored page with the given slug
 * from the content folder of the lab page
 */
const stored = (slug: string): Stored | null => {
	const candidates = [
		...(existsSync(`${target}/_drafts`) === true
			? readdirSync(`${target}/_drafts`).map((dir) => `_drafts/${dir}`)
			: []),
		...readdirSync(target)
	];

	const dir = candidates.find(
		(dir) => dir.replace(/^(_drafts\/|\d+_)/, "") === slug
	);

	if (dir === undefined) {
		return null;
	}

	const file = readdirSync(`${target}/${dir}`).find((f) => f.endsWith(".txt"))!;

	return {
		content: readContent(`${scenario}/${dir}/${file}`),
		status: dir.startsWith("_drafts/")
			? "draft"
			: /^\d+_/.test(dir)
				? "listed"
				: "unlisted",
		template: file.replace(/\.en\.txt$/, "")
	};
};

test.beforeEach(async ({ page }) => {
	await page.goto(url);
	await expect(heading(page, "Page Creation", 1)).toBeVisible();
});

test("only offers to add pages where the status fits the list", async ({
	page
}) => {
	for (const name of [
		"simpleFields",
		"statusListed",
		"statusListedFiltered",
		"statusUnlisted",
		"statusUnlistedFiltered"
	]) {
		await expect(add(page, name)).toBeVisible();
	}

	for (const name of [
		"statusDraftFilteredListed",
		"statusListedFilteredUnlisted",
		"statusUnlistedFilteredListed",
		"statusListedUnlistedFilteredListed"
	]) {
		await expect(field(page, name).locator(".k-empty")).toBeVisible();
		await expect(add(page, name)).toHaveCount(0);
	}
});

test("creates drafts with custom fields", async ({ page }) => {
	await add(page, "simpleFields").click();

	await input(page, "Title").fill("Hello World");
	await expect(input(page, "URL appendix")).toHaveValue("hello-world");
	await expect(dialog(page)).toContainText("/other/page-creation/");

	await input(page, "Field a").fill("A value");
	await input(page, "Field b").fill("B value");
	await expect(create(page)).toHaveText("Create as Draft");
	await create(page).click();

	// redirects to the new page
	await expect(page).toHaveURL(
		/\/panel\/pages\/other\+page-creation\+hello-world$/
	);
	await expect(heading(page, "Hello World", 1)).toBeVisible();

	expect(stored("hello-world")).toMatchObject({
		content: { fielda: "A value", fieldb: "B value", title: "Hello World" },
		status: "draft",
		template: "page-creation-simple-fields"
	});
});

test("uses a custom slug", async ({ page }) => {
	await add(page, "simpleFields").click();

	await input(page, "Title").fill("Hello World");
	await input(page, "URL appendix").fill("Custom Slug!");
	await create(page).click();

	await expect(page).toHaveURL(/\+custom-slug$/);
	expect(stored("custom-slug")).not.toBeNull();
});

test("requires a title and a slug", async ({ page }) => {
	await add(page, "simpleFields").click();

	await expect(invalid(page, "title")).toBeVisible();
	await expect(invalid(page, "slug")).toBeVisible();

	await create(page).click();
	await expect(dialog(page)).toBeVisible();
	expect(readdirSync(target)).toEqual(readdirSync(source));
});

test("uses a custom title label", async ({ page }) => {
	await add(page, "titleLabel").click();
	await expect(
		dialog(page).locator(".k-field-name-title .k-label-text")
	).toHaveText("Custom Title");
});

test("stays on the current view without redirect", async ({ page }) => {
	await add(page, "noRedirect").click();
	await input(page, "Title").fill("No Redirect");
	await create(page).click();

	await expect(dialog(page)).toBeHidden();
	await expect(page).toHaveURL(/\/panel\/pages\/other\+page-creation$/);
	await expect(titles(page, "noRedirect")).toHaveText(["No Redirect"]);
	expect(stored("no-redirect")?.status).toBe("draft");
});

test("creates listed pages", async ({ page }) => {
	await add(page, "statusListed").click();
	await input(page, "Title").fill("Listed Page");
	await expect(create(page)).toHaveText("Create as Public");
	await create(page).click();

	await expect(page).toHaveURL(/\+listed-page$/);
	expect(stored("listed-page")?.status).toBe("listed");

	// the page shows up in the list of listed pages
	await page.goto(url);
	await expect(titles(page, "statusListedFiltered")).toHaveText([
		"Listed Page"
	]);
});

test("creates unlisted pages", async ({ page }) => {
	await add(page, "statusUnlisted").click();
	await input(page, "Title").fill("Unlisted Page");
	await expect(create(page)).toHaveText("Create as Unlisted");
	await create(page).click();

	await expect(page).toHaveURL(/\+unlisted-page$/);
	expect(stored("unlisted-page")?.status).toBe("unlisted");

	await page.goto(url);
	await expect(titles(page, "statusUnlistedFiltered")).toHaveText([
		"Unlisted Page"
	]);
});

test("asks for required fields of listed pages", async ({ page }) => {
	await add(page, "statusListedRequired").click();
	await input(page, "Title").fill("Required Page");
	await expect(create(page)).toHaveText("Create as Public");

	// the required fields are part of the dialog
	await expect(invalid(page, "fieldA")).toBeVisible();
	await expect(invalid(page, "fieldB")).toBeVisible();

	await create(page).click();
	await expect(dialog(page)).toBeVisible();
	expect(stored("required-page")).toBeNull();

	await input(page, "Field a").fill("A");
	await input(page, "Field b").fill("B");
	await create(page).click();

	await expect(page).toHaveURL(/\+required-page$/);
	expect(stored("required-page")).toMatchObject({
		content: { fielda: "A", fieldb: "B" },
		status: "listed"
	});
});

test("prefills and stores default values", async ({ page }) => {
	await add(page, "defaultValues").click();

	await expect(input(page, "Field a")).toHaveValue("Default value for field A");
	await expect(input(page, "Field b")).toHaveValue("Default value for field B");

	await input(page, "Title").fill("Defaults");
	await input(page, "Field b").fill("Changed B");
	await create(page).click();
	await expect(page).toHaveURL(/\+defaults$/);

	expect(stored("defaults")).toMatchObject({
		content: {
			fielda: "Default value for field A",
			fieldb: "Changed B",
			// not part of the dialog, but still gets its default
			fieldc: "Default value for field C"
		},
		status: "listed"
	});
});

test("validates custom fields in the dialog", async ({ page }) => {
	await add(page, "validateCustomFields").click();
	await input(page, "Title").fill("Validated");

	// field A is required
	await expect(invalid(page, "fieldA")).toBeVisible();

	// field B needs 3 to 5 characters
	await input(page, "Field a").fill("A");
	await input(page, "Field b").fill("ab");
	await expect(invalid(page, "fieldA")).toBeHidden();
	await expect(invalid(page, "fieldB")).toBeVisible();

	await create(page).click();
	await expect(dialog(page)).toBeVisible();
	expect(stored("validated")).toBeNull();

	await input(page, "Field b").fill("abcd");
	await expect(invalid(page, "fieldB")).toBeHidden();
	await create(page).click();

	await expect(page).toHaveURL(/\+validated$/);
	expect(stored("validated")).toMatchObject({
		content: { fielda: "A", fieldb: "abcd" },
		status: "listed"
	});
});

test("builds title and slug from custom fields", async ({ page }) => {
	await add(page, "customTitleAndSlug").click();

	// no title and slug inputs, as they are generated
	await expect(dialog(page).locator(".k-field-name-title")).toHaveCount(0);
	await expect(dialog(page).locator(".k-field-name-slug")).toHaveCount(0);

	await input(page, "Location").fill("Springfield");
	await input(page, "Date").fill("2024-05-03");
	await input(page, "Date").press("Tab");
	await create(page).click();

	await expect(page).toHaveURL(/\+springfield-2024-05-03$/);
	await expect(heading(page, "Springfield – May 2024", 1)).toBeVisible();

	expect(stored("springfield-2024-05-03")).toMatchObject({
		content: { location: "Springfield", title: "Springfield – May 2024" },
		status: "draft"
	});
});

test("uses the page UUID in custom title and slug", async ({ page }) => {
	// nothing to fill in, so the page is created right away
	await add(page, "customTitleAndSlugWithUUIDs").click();
	await expect(page).toHaveURL(/\/panel\/pages\/other\+page-creation\+\w+$/);

	const slug = page.url().split("+").pop()!;
	const page_ = stored(slug);

	expect(page_).not.toBeNull();
	expect(page_!.content.title).toBe(`Test ${slug}`);
	expect(page_!.content.test).toBe(slug);

	// Known bug: the UUID used for title, slug and defaults differs
	// from the UUID stored for the page. Remove this line once fixed.
	test.fail();

	expect(page_!.content.uuid).toBe(slug);
});
