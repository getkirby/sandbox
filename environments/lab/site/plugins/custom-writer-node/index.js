panel.plugin("getkirby/custom-writer-node", {
	writerNodes: {
		advert: {
			get button() {
				return {
					icon: "megaphone",
					label: "Advert",
				};
			},

			commands({ type, utils }) {
				return () => utils.toggleWrap(type);
			},

			get name() {
				return "advert";
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
		marker: {
			get button() {
				return {
					icon: "bookmark",
					label: "Mark",
					inline: true,
				};
			},

			get name() {
				return "marker";
			},
		},
	},
});
