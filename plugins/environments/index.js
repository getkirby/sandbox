panel.plugin("yourname/todos", {
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
							<!--<k-button
								dialog="environments/create"
								icon="add"
								text="Store as new"
								size="sm"
								variant="filled"
							 />-->
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
