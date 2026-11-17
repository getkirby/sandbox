import { existsSync, readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
	dialog,
	expect,
	heading,
	openSettings,
	openSettingsDialog,
	restoreAfterEach,
	save,
	test
} from "./fixtures.ts";

const source = "environments/lab/content/fields/filelist";
const target = "public/content/fields/filelist";
const base = "/panel/pages/fields+filelist/files";

/**
 * Returns the file details as `{ term: value }`
 */
const details = async (page: Page) => {
	const terms = preview(page).locator("dt");
	await expect(terms.first()).toBeVisible();

	return Object.fromEntries(
		await terms.evaluateAll((elements) =>
			elements.map((dt) => [
				dt.textContent?.trim(),
				// normalize non-breaking spaces in formatted values
				dt.nextElementSibling?.textContent?.replace(/\s+/g, " ").trim()
			])
		)
	);
};

const meta = (filename: string) =>
	readFileSync(`${target}/${filename}.en.txt`, "utf8");

const preview = (page: Page) => page.locator(".k-file-preview");

test.describe("previews", () => {
	test("shows images with their details", async ({ page }) => {
		await page.goto(`${base}/creatious-labs-1.jpg`);

		await expect(heading(page, "creatious-labs-1.jpg", 1)).toBeVisible();
		await expect(preview(page)).toHaveClass(/k-image-file-preview/);
		await expect(preview(page).locator("img")).toBeVisible();

		expect(await details(page)).toMatchObject({
			Dimensions: "1400 × 933 Pixel",
			"Media Type": "image/jpeg",
			Orientation: "Landscape",
			Size: "60.9 KB",
			Template: "—"
		});
		await expect(
			preview(page).getByRole("button", { name: "Set focal point" })
		).toBeVisible();
	});

	test("shows PDFs", async ({ page }) => {
		await page.goto(`${base}/kirby.pdf`);

		await expect(preview(page)).toHaveClass(/k-pdf-file-preview/);
		await expect(preview(page).locator("object")).toBeAttached();
		expect(await details(page)).toMatchObject({
			"Media Type": "application/pdf"
		});
	});

	test("shows audio files", async ({ page }) => {
		await page.goto(`${base}/water.mp3`);

		await expect(preview(page)).toHaveClass(/k-audio-file-preview/);
		await expect(preview(page).locator("audio")).toHaveAttribute(
			"src",
			/water\.mp3$/
		);
		expect(await details(page)).toMatchObject({ "Media Type": "audio/mpeg" });
	});

	test("shows videos", async ({ page }) => {
		await page.goto(`${base}/water-glass.mp4`);

		await expect(preview(page)).toHaveClass(/k-video-file-preview/);
		await expect(preview(page).locator("video")).toHaveAttribute(
			"src",
			/water-glass\.mp4$/
		);
		expect(await details(page)).toMatchObject({ "Media Type": "video/mp4" });
	});

	test("uses custom previews from plugins", async ({ page }) => {
		await page.goto(`${base}/camera.glb`);

		await expect(preview(page)).toHaveClass(/k-glb-file-preview/);
		await expect(preview(page).locator("model-viewer")).toHaveAttribute(
			"src",
			/camera\.glb$/
		);

		// the plugin adds its own details
		expect(await details(page)).toMatchObject({
			Author: "Virtual Museums of Małopolska",
			License: "CC0-1.0",
			"Media Type": "model/gltf-binary",
			Template: "undeletable-file"
		});
	});
});

test.describe("navigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${base}/creatious-labs-1.jpg`);
		await expect(heading(page, "creatious-labs-1.jpg", 1)).toBeVisible();
	});

	test("shows the breadcrumb", async ({ page }) => {
		await expect(
			page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link")
		).toHaveText(["Lab", "Fields", "Filelist", "creatious-labs-1.jpg"]);
	});

	test("links to the file", async ({ page }) => {
		const open = page
			.locator(".k-view-buttons")
			.getByRole("link", { name: "Open" });
		await expect(open).toHaveAttribute(
			"href",
			/\/media\/pages\/fields\/filelist\/.+\/creatious-labs-1\.jpg$/
		);
	});

	test("navigates to the next file", async ({ page }) => {
		await page
			.getByRole("main")
			.getByRole("link", { name: "creatious-labs-2.jpg" })
			.click();

		await expect(page).toHaveURL(
			new RegExp(`${RegExp.escape(base)}/creatious-labs-2\\.jpg$`)
		);
		await expect(heading(page, "creatious-labs-2.jpg", 1)).toBeVisible();
	});

	test("navigates with the arrow keys", async ({ page }) => {
		await page.keyboard.press("ArrowRight");
		await expect(heading(page, "creatious-labs-2.jpg", 1)).toBeVisible();

		await page.keyboard.press("ArrowLeft");
		await expect(heading(page, "creatious-labs-1.jpg", 1)).toBeVisible();
	});
});

test.describe("options", () => {
	test("shows the file options", async ({ page }) => {
		await page.goto(`${base}/creatious-labs-1.jpg`);

		await expect(await openSettings(page)).toMatchAriaSnapshot(`
			- dialog:
			  - button "Rename"
			  - button "Change template"
			  - separator
			  - button "Replace"
			  - separator
			  - button "Delete"
		`);
	});

	test("prevents deleting undeletable files", async ({ page }) => {
		await page.goto(`${base}/camera.glb`);

		const dropdown = await openSettings(page);
		await expect(
			dropdown.getByRole("button", { name: "Delete" })
		).toBeDisabled();
		await expect(
			dropdown.getByRole("button", { name: "Rename" })
		).toBeEnabled();
	});
});

test.describe("changes", () => {
	restoreAfterEach("content/fields/filelist");

	// leaving the view of a renamed or deleted file still sends an
	// unlock request for the old path, which fails with a 404
	// (see issues/unlock-after-delete.md)
	test.use({ ignoreErrors: [/status of 404/] });

	test("renames files", async ({ page }) => {
		await page.goto(`${base}/kirby.pdf`);
		await openSettingsDialog(page, "Rename");

		const input = dialog(page).getByRole("textbox");
		await expect(input).toHaveValue("kirby");
		await expect(dialog(page)).toContainText(".pdf");

		await input.fill("Kirby Manual");
		await dialog(page).getByRole("button", { name: "Rename" }).click();

		await expect(page).toHaveURL(
			new RegExp(`${RegExp.escape(base)}/kirby-manual\\.pdf$`)
		);
		await expect(heading(page, "kirby-manual.pdf", 1)).toBeVisible();

		expect(existsSync(`${target}/kirby-manual.pdf`)).toBe(true);
		expect(existsSync(`${target}/kirby-manual.pdf.en.txt`)).toBe(true);
		expect(existsSync(`${target}/kirby.pdf`)).toBe(false);
	});

	test("deletes files", async ({ page }) => {
		await page.goto(`${base}/kirby.pdf`);
		await openSettingsDialog(page, "Delete");

		await expect(dialog(page)).toContainText("kirby.pdf");
		await dialog(page).getByRole("button", { name: "Delete" }).click();

		await expect(page).toHaveURL(/\/panel\/pages\/fields\+filelist$/);
		expect(existsSync(`${target}/kirby.pdf`)).toBe(false);
		expect(existsSync(`${target}/kirby.pdf.en.txt`)).toBe(false);
	});

	test("sets and removes the focal point", async ({ page }) => {
		await page.goto(`${base}/creatious-labs-1.jpg`);
		await preview(page)
			.getByRole("button", { name: "Set focal point" })
			.click();

		// the focal point is set to the center of the image
		await expect
			.poll(async () => (await details(page)).Focus)
			.toMatch(/^\d+% \d+%$/);

		// it's an unsaved change like any other content change
		await save(page).click();
		await expect(save(page)).toBeHidden();
		expect(meta("creatious-labs-1.jpg")).toMatch(/Focus: [\d.]+% [\d.]+%/);

		await preview(page)
			.getByRole("button", { name: "Remove focal point" })
			.click();
		await expect(
			preview(page).getByRole("button", { name: "Set focal point" })
		).toBeVisible();
	});

	test("replaces files", async ({ page }) => {
		await page.goto(`${base}/creatious-labs-1.jpg`);
		expect((await details(page)).Size).toBe("60.9 KB");

		const chooser = page.waitForEvent("filechooser");
		await (
			await openSettings(page)
		)
			.getByRole("button", { name: "Replace" })
			.click();
		await (await chooser).setFiles(`${source}/creatious-labs-2.jpg`);

		// the dialog compares the old and the new file
		// and keeps the original filename
		await expect(dialog(page).getByRole("textbox")).toHaveValue(
			"creatious-labs-1"
		);
		await expect(dialog(page).getByRole("textbox")).toBeDisabled();
		await dialog(page).getByRole("button", { name: "Replace" }).click();
		await expect(dialog(page)).toBeHidden();

		// the file keeps its name, but gets the new content
		await expect(heading(page, "creatious-labs-1.jpg", 1)).toBeVisible();
		await expect
			.poll(async () => (await details(page)).Size)
			.not.toBe("60.9 KB");
		expect(readFileSync(`${target}/creatious-labs-1.jpg`)).toEqual(
			readFileSync(`${source}/creatious-labs-2.jpg`)
		);
	});
});
