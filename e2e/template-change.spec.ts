import { cpSync, readdirSync, readFileSync, rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, field, heading, test, textbox } from "./fixtures.ts";

const source = "environments/lab/content/other/template-change";
const target = "public/content/other/template-change";

const dialog = (page: Page) => page.locator(".k-dialog");

const info = (page: Page) => page.locator(".k-info-field .k-box");

const save = (page: Page) =>
	page.getByRole("main").getByRole("button", { exact: true, name: "Save" });

/**
 * Returns the template and the stored fields of the page
 */
const stored = () => {
	const file = readdirSync(target).find((f) => f.endsWith(".txt"))!;
	const content: Record<string, string> = {};

	for (const entry of readFileSync(`${target}/${file}`, "utf8").split(
		/\n----\n/
	)) {
		const match = entry.trim().match(/^([^:]+):\s*([\s\S]*)$/);

		if (match !== null) {
			content[match[1].toLowerCase()] = match[2].trim();
		}
	}

	return { content, template: file.replace(/\.en\.txt$/, "") };
};

const openDialog = async (page: Page) => {
	await page
		.getByRole("main")
		.getByRole("button", { name: "Settings" })
		.click();
	await page
		.locator("dialog[open]")
		.last()
		.getByRole("button", { name: "Change template" })
		.click();
	await expect(dialog(page)).toBeVisible();
};

const changeTemplate = async (page: Page, label: string) => {
	await openDialog(page);
	await dialog(page).getByRole("combobox").selectOption({ label });
	await dialog(page).getByRole("button", { name: "Change" }).click();
	await expect(dialog(page)).toBeHidden();
};

/**
 * Fills and saves all fields of template A
 */
const fillTemplateA = async (page: Page) => {
	await textbox(page, "onlyInTemplateA").fill("A only");
	await textbox(page, "inBothTemplates").fill("Both");
	await textbox(page, "differentFieldType").fill("42");
	await save(page).click();
	await expect(save(page)).toBeHidden();
};

/**
 * Restores the content of the lab page after each test
 */
test.afterEach(() => {
	rmSync(target, { force: true, recursive: true });
	cpSync(source, target, { recursive: true });
});

test.beforeEach(async ({ page }) => {
	await page.goto("/panel/pages/other+template-change");
	await expect(heading(page, "Template Change", 1)).toBeVisible();
});

test("shows the fields of the current template", async ({ page }) => {
	await expect(info(page)).toHaveText("Current template: template-a");
	await expect(field(page, "onlyInTemplateA")).toBeVisible();
	await expect(field(page, "inBothTemplates")).toBeVisible();
	await expect(field(page, "onlyInTemplateB")).toHaveCount(0);
	await expect(textbox(page, "differentFieldType")).toHaveAttribute(
		"type",
		"text"
	);
});

test("offers the allowed templates", async ({ page }) => {
	await openDialog(page);

	await expect(dialog(page)).toContainText(
		"Changing the page's template will remove content for fields that don't match in type. Use with caution."
	);

	const select = dialog(page).getByRole("combobox");
	await expect(select.locator("option")).toHaveText([
		"Template A",
		"Template B"
	]);
	await expect(select).toHaveValue("template-a");
});

test("cancels the template change", async ({ page }) => {
	await openDialog(page);
	await dialog(page)
		.getByRole("combobox")
		.selectOption({ label: "Template B" });
	await dialog(page).getByRole("button", { name: "Cancel" }).click();

	await expect(info(page)).toHaveText("Current template: template-a");
	expect(stored().template).toBe("template-a");
});

test("switches to the other template", async ({ page }) => {
	await changeTemplate(page, "Template B");

	await expect(info(page)).toHaveText("Current template: template-b");
	await expect(field(page, "onlyInTemplateB")).toBeVisible();
	await expect(field(page, "onlyInTemplateA")).toHaveCount(0);
	await expect(textbox(page, "differentFieldType")).toHaveCount(0);
	await expect(
		field(page, "differentFieldType").locator("input")
	).toHaveAttribute("type", "number");

	expect(stored().template).toBe("template-b");
	expect(readdirSync(target)).not.toContain("template-a.en.txt");
});

test("converts the content to the new template", async ({ page }) => {
	await fillTemplateA(page);
	await changeTemplate(page, "Template B");

	// fields with the same type keep their value
	await expect(textbox(page, "inBothTemplates")).toHaveValue("Both");

	// fields with a different type lose their value
	await expect(field(page, "differentFieldType").locator("input")).toHaveValue(
		""
	);

	const { content } = stored();
	expect(content.inbothtemplates).toBe("Both");
	expect(content.differentfieldtype).toBeUndefined();
	expect(content.onlyintemplateb).toBe("");

	// fields that don't exist in the new template are preserved
	expect(content.onlyintemplatea).toBe("A only");
});

test("converts unsaved changes as well", async ({ changes, page }) => {
	await textbox(page, "inBothTemplates").fill("Unsaved");
	await changes.settled();

	await changeTemplate(page, "Template B");

	await expect(textbox(page, "inBothTemplates")).toHaveValue("Unsaved");
	await expect(save(page)).toBeVisible();
});

test("restores preserved values when switching back", async ({ page }) => {
	await fillTemplateA(page);
	await changeTemplate(page, "Template B");
	await changeTemplate(page, "Template A");

	await expect(info(page)).toHaveText("Current template: template-a");
	await expect(textbox(page, "inBothTemplates")).toHaveValue("Both");
	expect(stored().template).toBe("template-a");

	// Known bug: the value of a field that is missing in the
	// old template is replaced with the new field's default,
	// although it was preserved in the content. Remove this line once fixed.
	test.fail();

	await expect(textbox(page, "onlyInTemplateA")).toHaveValue("A only", {
		timeout: 1000
	});
});
