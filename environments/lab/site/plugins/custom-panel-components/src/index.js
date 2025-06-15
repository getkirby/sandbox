import Section from "./Section.vue";

panel.plugin("plugins/custom-panel-components", {
	sections: {
		"extends-string": {
			extends: "k-info-section",
		},
		"extends-sfc": {
			extends: Section,
		},
	},
});
