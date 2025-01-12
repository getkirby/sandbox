panel.plugin("getkirby/custom-view-buttons", {
	viewButtons: {
		applause: {
			props: {
				theme: String,
			},
			template: `<k-button icon="heart" variant="filled" :theme="theme" size="sm" @click="applause">Applause</k-button>`,
			methods: {
				applause() {
					alert("👏");
				},
			},
		},
	},
});
