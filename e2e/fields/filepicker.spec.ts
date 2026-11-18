import { expect, field, test } from "../fixtures.ts";
import { deleteTests, pick, pickerTests } from "./picker.ts";

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

deleteTests({
	dialog: "pages/fields+filepicker/files/creatious-labs-2.jpg/delete",
	path: "content/fields/filepicker/creatious-labs-2.jpg",
	pick: (page) => pick(page, "filepicker", "creatious-labs-2.jpg"),
	// `creatious-labs-1.jpg` is also stored in the `disabledWithValue` field
	restore: [
		"content/fields/filepicker",
		(entry) => entry.startsWith("creatious-labs-2.jpg")
	],
	title: "creatious-labs-2.jpg",
	type: "filepicker",
	value: "file://aPyw9OXmsk6PCEm8"
});
