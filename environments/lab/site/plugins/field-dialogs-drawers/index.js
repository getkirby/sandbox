panel.plugin("plugins/field-dialogs-drawers", {
	fields: {
		dialogsdrawers: {
			props: {
				label: String,
				endpoints: Object,
			},
			template: `
				<k-field v-bind="$props">
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
				</k-field>
			`,
		},
	},
});
