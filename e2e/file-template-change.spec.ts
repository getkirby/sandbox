import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	field,
	heading,
	openSettingsDialog,
	readContent,
	restoreAfterEach,
	save,
	test,
	textbox,
	titles
} from "./fixtures.ts";

const filename = "could-be-hawaii.jpg";
const parent = "/panel/pages/other+file-template-change";
const url = `${parent}/files/${filename}`;

restoreAfterEach("content/other/file-template-change");

const changeTemplate = async (page: Page, template: string) => {
	await openSettingsDialog(page, "Change template");
	await dialog(page).getByRole("combobox").selectOption(template);
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

const info = (page: Page) => page.locator(".k-info-field .k-box");

/**
 * Returns the stored meta data of the file
 */
const stored = () =>
	readContent(`other/file-template-change/${filename}.en.txt`);

const templateStat = (page: Page) =>
	page
		.getByRole("main")
		.getByRole("term")
		.filter({ hasText: /^Template$/ })
		.locator("xpath=following-sibling::dd[1]");

test.describe("page", () => {
	test("lists the files by template", async ({ page }) => {
		await page.goto(parent);
		await expect(heading(page, "File Template Change", 1)).toBeVisible();

		await expect(titles(page, "filesWithTemplateA")).toHaveText([filename]);
		await expect(
			field(page, "filesWithTemplateB").locator(".k-empty")
		).toHaveText("No files yet");
	});

	test("moves the file to the other list", async ({ page }) => {
		await page.goto(url);
		await changeTemplate(page, "file-template-b");

		await page.goto(parent);
		await expect(titles(page, "filesWithTemplateB")).toHaveText([filename]);
		await expect(
			field(page, "filesWithTemplateA").locator(".k-empty")
		).toBeVisible();
	});
});

test.describe("file", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(url);
		await expect(heading(page, filename, 1)).toBeVisible();
	});

	test("shows the fields of the current template", async ({ page }) => {
		await expect(templateStat(page)).toHaveText("file-template-a");
		await expect(info(page)).toHaveText("Current template: file-template-a");
		await expect(field(page, "onlyInTemplateA")).toBeVisible();
		await expect(field(page, "onlyInTemplateB")).toHaveCount(0);
		await expect(textbox(page, "differentFieldType")).toHaveAttribute(
			"type",
			"text"
		);
	});

	test("offers the allowed templates", async ({ page }) => {
		await openSettingsDialog(page, "Change template");

		await expect(dialog(page)).toContainText(
			"Changing the file's template will remove content for fields that don't match in type. If the new template defines certain rules, e.g. image dimensions, those will also be applied irreversibly. Use with caution."
		);

		const select = dialog(page).getByRole("combobox");
		await expect(select.locator("option")).toHaveText([
			"File Template A (file-template-a)",
			"File Template B (file-template-b)"
		]);
		await expect(select).toHaveValue("file-template-a");
	});

	test("cancels the template change", async ({ page }) => {
		await openSettingsDialog(page, "Change template");
		await dialog(page).getByRole("combobox").selectOption("file-template-b");
		await dialog(page).getByRole("button", { name: "Cancel" }).click();

		await expect(templateStat(page)).toHaveText("file-template-a");
		expect(stored().template).toBe("file-template-a");
	});

	test("switches to the other template", async ({ page }) => {
		await changeTemplate(page, "file-template-b");

		// the file view stays open
		await expect(page).toHaveURL(new RegExp(`${RegExp.escape(url)}$`));
		await expect(templateStat(page)).toHaveText("file-template-b");
		await expect(info(page)).toHaveText("Current template: file-template-b");
		await expect(field(page, "onlyInTemplateB")).toBeVisible();
		await expect(field(page, "onlyInTemplateA")).toHaveCount(0);
		await expect(
			field(page, "differentFieldType").locator("input")
		).toHaveAttribute("type", "number");

		expect(stored().template).toBe("file-template-b");
	});

	test("converts the meta data to the new template", async ({ page }) => {
		await fillTemplateA(page);
		await changeTemplate(page, "file-template-b");

		// fields with the same type keep their value
		await expect(textbox(page, "inBothTemplates")).toHaveValue("Both");

		// fields with a different type lose their value
		await expect(
			field(page, "differentFieldType").locator("input")
		).toHaveValue("");

		const content = stored();
		expect(content.inbothtemplates).toBe("Both");
		expect(content.differentfieldtype).toBeUndefined();
		expect(content.onlyintemplateb).toBe("");
		expect(content.uuid).toBe("ufopfmuotf0vmzp7");

		// fields that don't exist in the new template are preserved
		expect(content.onlyintemplatea).toBe("A only");
	});

	test("converts unsaved changes as well", async ({ changes, page }) => {
		await textbox(page, "inBothTemplates").fill("Unsaved");
		await changes.settled();

		await changeTemplate(page, "file-template-b");

		await expect(textbox(page, "inBothTemplates")).toHaveValue("Unsaved");
		await expect(save(page)).toBeVisible();
	});

	test("restores preserved values when switching back", async ({ page }) => {
		await fillTemplateA(page);
		await changeTemplate(page, "file-template-b");
		await changeTemplate(page, "file-template-a");

		await expect(templateStat(page)).toHaveText("file-template-a");
		await expect(textbox(page, "inBothTemplates")).toHaveValue("Both");

		// Known bug: the value of a field that is missing in the
		// old template is replaced with the new field's default,
		// although it was preserved in the meta data.
		// Remove this line once fixed.
		test.fail();

		await expect(textbox(page, "onlyInTemplateA")).toHaveValue("A only", {
			timeout: 1000
		});
	});
});
