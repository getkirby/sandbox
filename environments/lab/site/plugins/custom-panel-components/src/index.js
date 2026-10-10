import Field from "./Field.vue";

panel.plugin("plugins/custom-panel-components", {
	fields: {
		extendsstring: {
			extends: "k-info-field",
		},
		extendssfc: {
			extends: Field,
		},
	},
});
