<template>
	<div class="k-ui-example" :data-flex="flex" :aria-label="label" tabindex="0">
		<div class="k-ui-example-canvas">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	props: {
		label: String,
		flex: Boolean,
	},
};
</script>

<style>
.k-ui-example {
	position: relative;
	container-type: inline-size;
	max-width: 100%;
	padding: 1.5rem;
	outline-offset: -2px;
	border-radius: var(--rounded);
}
.k-ui-example::before {
	position: absolute;
	inset-block-start: 0.5rem;
	inset-inline-start: 0;
	font-size: 10px;
	content: attr(aria-label);
	color: var(--color-gray-600);
}
.k-ui-example .k-ui-example-canvas {
	padding: 1.5rem;
}
.k-ui-example[data-flex] .k-ui-example-canvas {
	display: flex;
	align-items: center;
	gap: var(--spacing-6);
}
.k-ui-example + .k-ui-example {
	border-block-start: 1px dashed var(--color-border);
}
</style>
