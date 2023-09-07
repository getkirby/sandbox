<template>
	<k-ui-examples>
		<k-ui-example label="coords">
			<k-grid style="--columns: 2; gap: 3rem">
				<k-coords @input="coords = $event.detail">
					<img :src="src" @dragstart.prevent />
				</k-coords>
				<k-code>{{ coords }}</k-code>
			</k-grid>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	props: {
		src: String
	},
	data() {
		return {
			coords: {
				x: 0,
				y: 0
			}
		};
	}
};
</script>

<style>
.k-ui-example .k-coords,
.k-ui-example .k-coords img {
	border-radius: var(--rounded);
}
</style>
