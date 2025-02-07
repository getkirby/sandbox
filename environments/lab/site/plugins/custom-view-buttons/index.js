panel.plugin("getkirby/custom-view-buttons", {
	viewButtons: {
		applause: {
			props: {
				praise: String,
				text: {
					type: String,
					default: "Applause",
				},
				theme: String,
			},
			template: `<k-button icon="heart" variant="filled" :theme="theme" size="sm" @click="applause">{{ text }}</k-button>`,
			methods: {
				applause() {
					alert("👏 " + this.praise);
				},
			},
		},
	},
});
