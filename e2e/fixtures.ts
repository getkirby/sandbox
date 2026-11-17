import { test as base, expect, type Page } from "@playwright/test";

/**
 * Fails every test that logs console errors, throws
 * page errors or opens unexpected dialogs
 */
export const test = base.extend<{ errors: string[] }>({
	errors: [
		async ({ page }, use) => {
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

			expect(errors).toEqual([]);
		},
		{ auto: true }
	]
});

export const heading = (page: Page, name: string, level: number) =>
	page.getByRole("main").getByRole("heading", { exact: true, level, name });

export { expect };
