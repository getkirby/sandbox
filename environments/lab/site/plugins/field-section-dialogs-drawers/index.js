panel.plugin("plugins/field-dialogs-drawers", {
	fields: {
		"field-with-dialogs-drawers": {
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
	sections: {
		"section-with-dialogs-drawers": {
			props: {
				name: String,
				parent: String,
			},
			template: `
				<k-section v-bind="$props" label="Section with dialogs and drawers">
					<k-button-group>
						<k-button
							text="Open dialog"
							variant="filled"
							@click="$dialog(parent + '/sections/' + name + '/test')"
						/>
						<k-button
							text="Open drawer"
							variant="filled"
							@click="$drawer(parent + '/sections/' + name + '/test')"
						/>
					</k-button-group>
					<k-text
						html="Section dialogs/drawers only work in Kirby 6+"
						class="k-help"
						style="margin-top: var(--spacing-2)"
					/>
				</k-section>
			`,
		},
	},
});
