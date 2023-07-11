panel.plugin("getkirby/environments", {
	components: {
		"k-environments-view": {
			props: {
				environments: Array,
			},
			template: `
				<k-panel-inside class="k-environments-view">
					<k-header class="k-users-view-header">
						Sandbox

						<template #buttons>
							<k-button
								:link="$panel.urls.site"
								target="_blank"
								icon="open"
								size="sm"
								variant="filled"
							 />
							<k-button
								dialog="environments/create"
								icon="add"
								text="New environment"
								size="sm"
								variant="filled"
							 />
						</template>
					</k-header>

					<k-collection
						:empty="{ text: 'No environments yet', icon: 'box' }"
						:items="environments"
					/>
				</k-panel-inside>
			`,
		},
	},
});
