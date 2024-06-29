panel.plugin("getkirby/custom-file-preview", {
	components: {
		"k-file-glb-preview": {
			template: `
				<k-file-preview :details="details" class="k-file-glb-preview">
					<script type="module" :src="asset"></script>
					<model-viewer :src="url" ar shadow-intensity="1" camera-controls touch-action="pan-y" />
				</k-file-preview>
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
			app.config.ignoredElements.push("model-viewer");
		},
	],
});
