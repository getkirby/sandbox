import { dialog, expect, test } from "../fixtures.ts";
import { dialogItems, open, pickerTests } from "./picker.ts";

pickerTests({
	disabledValue: "File Template Change",
	empty: "No pages selected yet",
	items: ["Benchmarks", "Error", "Fields"],
	scheme: "page",
	title: "Pagepicker",
	type: "pagepicker"
});

test("navigates through the page tree", async ({ page }) => {
	await open(page, "pagepicker");

	const back = dialog(page).getByRole("button", { name: "Back" });
	await expect(back).toBeDisabled();
	await expect(dialog(page).getByRole("heading", { level: 2 })).toHaveText(
		"Lab"
	);

	// pages without children can't be opened
	await expect(
		dialog(page)
			.locator(".k-item")
			.filter({ hasText: /^Error/ })
			.getByRole("button", { name: "Open" })
	).toBeDisabled();

	await dialog(page)
		.locator(".k-item")
		.filter({ hasText: /^Fields/ })
		.getByRole("button", { name: "Open" })
		.click();

	await expect(dialog(page).getByRole("heading", { level: 2 })).toHaveText(
		"Fields"
	);
	await expect(dialogItems(page).first()).toHaveText("Blocks");

	await back.click();
	await expect(dialog(page).getByRole("heading", { level: 2 })).toHaveText(
		"Lab"
	);
});
