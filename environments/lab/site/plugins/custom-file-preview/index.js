panel.plugin("getkirby/custom-file-preview", {
	components: {
		"k-file-glb-preview": {
			template: `
				<figure class="k-file-default-preview k-file-glb-preview">
					<k-file-preview-thumb>
						<script type="module" :src="asset"></script>
						<model-viewer :src="url" ar shadow-intensity="1" camera-controls touch-action="pan-y" />
					</k-file-preview-thumb>

					<figcaption>
						<k-file-preview-details :details="details" />
					</figcaption>
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
			app.config.ignoredElements.push("model-viewer");
		},
	],
});
