panel.plugin("getkirby/playground", {
	sections: {
		playground: {
			inheritAttrs: false,
			data() {
				return {
					label: null,
					components: [],
				};
			},
			async created() {
				const response = await this.$api.get(
					this.parent + "/sections/" + this.name
				);

				this.label = response.label ?? this.name;
				this.components = response.components ?? [];
			},
			template: `
				<div class="k-ui-playground" :aria-label="label" tabindex="0">
					<div class="k-ui-playground-canvas" :data-children="components.length">
						<component
							v-for="(example, index) in components"
							:key="index"
							:is="example.component"
							v-bind="example.props"
							:style="example.style"
						/>
					</div>
				</div>
			`,
		},
	},
});
