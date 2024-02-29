panel.plugin("getkirby/custom-textarea-buttons", {
	textareaButtons: {
		highlight: {
			label: "Highlight",
			icon: "wand",
			click: function () {
				this.command("toggle", "<mark>", "</mark>");
			},
			shortcut: "m",
		},
	},
});
