import { pickerTests } from "./picker.ts";

pickerTests({
	disabledValue: "editor",
	empty: "No users selected yet",
	items: ["admin", "client", "editor"],
	scheme: "user",
	title: "Userpicker",
	type: "userpicker"
});
