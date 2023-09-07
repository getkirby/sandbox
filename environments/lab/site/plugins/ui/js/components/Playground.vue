<template>
	<k-panel-inside :data-has-tabs="tabs.length > 1" class="k-ui-playground-view">
		<k-header>
			{{ title }}
			<k-button-group slot="buttons" layout="collapsed">
				<k-button
					icon="code"
					@click="inspect = true"
					:theme="inspect === true ? 'positive' : null"
					variant="filled"
					size="sm"
				/>
				<k-button
					icon="palette"
					@click="inspect = false"
					variant="filled"
					:theme="inspect === false ? 'positive' : null"
					size="sm"
				/>
			</k-button-group>
		</k-header>
		<k-tabs :tab="tab" :tabs="tabs" />

		<template v-if="inspect">
			<k-headline style="margin-bottom: 0.5rem">Example code</k-headline>
			<k-code>{{ template }}</k-code>
		</template>
		<template v-else>
			<component v-if="file" :is="component" v-bind="props" />
			<component v-if="styles" is="style" v-html="styles"></component>
		</template>
	</k-panel-inside>
</template>

<script>
export default {
	props: {
		file: String,
		props: Object,
		styles: String,
		tab: String,
		tabs: {
			type: Array,
			default: () => [],
		},
		template: String,
		title: String,
	},
	data() {
		return {
			component: null,
			inspect: false,
		};
	},
	watch: {
		tab: {
			handler() {
				this.createComponent();
			},
			immediate: true,
		},
	},
	methods: {
		async createComponent() {
			if (!this.file) {
				return;
			}

			const component = await import(
				/* @vite-ignore */
				this.$panel.url(this.file)
			);

			// add the template to the component
			component.default.template = this.template;

			this.component = component.default;
		},
	},
};
</script>

<style>
.k-ui-playground-view[data-has-tabs="true"] .k-header {
	margin-bottom: 0;
}
</style>
