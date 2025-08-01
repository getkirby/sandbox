panel.plugin("plugins/field-dialogs-drawers", {
	fields: {
		"field-with-dialogs-drawers": {
			props: {
				endpoints: Object,
			},
			template: `
				<k-button-group>
					<k-button
						text="Open dialog"
						variant="filled"
						@click="$dialog(endpoints.field + '/test')"
					/>
					<k-button
						text="Open drawer"
						variant="filled"
						@click="$drawer(endpoints.field + '/test')"
					/>
				</k-button-group>
			`,
		},
	},
});
