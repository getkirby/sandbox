panel.plugin("plugins/custom-file-preview", {
	components: {
		"k-glb-file-preview": {
			template: `
				<figure class="k-default-file-preview k-glb-file-preview">
					<k-file-preview-frame>
						<component is="script" type="module" :src="asset" />
						<model-viewer :src="url" ar shadow-intensity="1" camera-controls touch-action="pan-y" />
					</k-file-preview-frame>

					<k-file-preview-details :details="details" />
				</figure>
			`,
			props: {
				asset: String,
				details: Array,
				url: String,
			},
		},
	},
	use: [
		function (app) {
			// register model-viewer as custom element
			// (depending on the version of Vue)
			const version = app.version.split(".").map(Number);
			if (version[0] < 3) {
				app.config.ignoredElements.push("model-viewer");
			} else {
				const before = app.config.compilerOptions?.isCustomElement;
				app.config.compilerOptions.isCustomElement = (tag) =>
					before?.(tag) || tag === "model-viewer";
			}
		},
	],
});
