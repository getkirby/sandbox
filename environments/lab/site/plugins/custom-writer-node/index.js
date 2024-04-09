panel.plugin("getkirby/custom-writer-node", {
	writerNodes: {
		quote: {
			get button() {
				return {
					icon: "quote",
					label: window.panel.$t("field.blocks.quote.name"),
				};
			},

			commands({ type, utils }) {
				return () => utils.toggleWrap(type);
			},

			get name() {
				return "quote";
			},

			get schema() {
				return {
					content: "block+",
					group: "block",
					defining: true,
					draggable: false,
					parseDOM: [
						{
							tag: "blockquote",
						},
					],
					toDOM: () => ["blockquote", 0],
				};
			},
		},
	},
});
