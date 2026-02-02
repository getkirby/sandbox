panel.plugin("test/custom-panel-dialogs-drawers", {
	components: {
		"k-test-nested-drawer": {
			extends: "k-text-drawer",
			props: {
				time: String
			},
			template: `
				<k-drawer
					class="k-text-drawer"
					v-bind="$props"
					@cancel="$emit('cancel')"
					@crumb="$emit('crumb', $event)"
					@submit="$emit('submit', value)"
					@tab="$emit('tab', $event)"
				>
				  <p>Current time: {{ time }}</p>
					<k-button drawer="test/nested" text="Open" variant="filled" />
				</k-drawer>
			`
		}
	}
})