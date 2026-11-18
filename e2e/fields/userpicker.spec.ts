import { deleteTests, pick, pickerTests } from "./picker.ts";

pickerTests({
	disabledValue: "editor",
	empty: "No users selected yet",
	items: ["admin", "client", "editor"],
	scheme: "user",
	title: "Userpicker",
	type: "userpicker"
});

// `editor` is stored in the `disabledWithValue` field
deleteTests({
	dialog: "users/client/delete",
	path: "site/accounts/client",
	pick: (page) => pick(page, "userpicker", "client"),
	restore: ["site/accounts", (account) => account === "client"],
	title: "client",
	type: "userpicker",
	value: "user://client"
});
