import { expect, field, test } from "../fixtures.ts";
import { pickerTests } from "./picker.ts";

pickerTests({
	disabledValue: "creatious-labs-1.jpg",
	empty: "No files selected yet",
	items: ["creatious-labs-1.jpg", "creatious-labs-2.jpg"],
	scheme: "file",
	title: "Filepicker",
	type: "filepicker"
});

test("offers uploads", async ({ page }) => {
	await expect(
		field(page, "filepicker").getByRole("button", { name: "Upload" })
	).toBeVisible();
	await expect(
		field(page, "disabled").getByRole("button", { name: "Upload" })
	).toHaveCount(0);
});
