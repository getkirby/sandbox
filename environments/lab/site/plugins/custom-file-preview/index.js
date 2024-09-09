panel.plugin("getkirby/custom-file-preview", {
	components: {
		"k-glb-file-preview": {
			template: `
				<figure class="k-default-file-preview k-glb-file-preview">
					<k-file-preview-frame>
						<script type="module" :src="asset"></script>
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
			app.config.ignoredElements.push("model-viewer");
		},
	],
});
