panel.plugin("getkirby/custom-writer-mark", {
	writerMarks: {
		highlight: {
			get button() {
				return {
					icon: "palette",
					label: window.panel.$t("color"),
				};
			},
			commands() {
				return () => this.toggle();
			},
			get name() {
				return "highlight";
			},
			get schema() {
				return {
					parseDOM: [{ tag: "mark" }],
					toDOM: () => ["mark", 0],
				};
			},
			view(mark, view, inline) {
				return new HighlightView(mark, view, inline);
			},
		},
	},
});

class HighlightView {
	constructor(mark, view, inline) {
		const el = document.createElement("mark");
		const before = document.createElement("span");
		before.textContent = "→ ";
		const after = document.createElement("span");
		after.textContent = " ←";

		this.contentDOM = document.createElement("span");

		el.appendChild(before);
		el.appendChild(this.contentDOM);
		el.appendChild(after);
		this.dom = el;
	}
}
