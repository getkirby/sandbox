panel.plugin("getkirby/custom-view-buttons", {
	viewButtons: {
		applause: {
			template: `<k-button icon="heart" variant="filled" theme="love" size="sm" @click="applause">Applause</k-button>`,
			methods: {
				applause() {
					alert("👏");
				},
			},
		},
	},
});
