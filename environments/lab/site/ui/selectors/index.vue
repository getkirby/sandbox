<template>
	<k-ui-examples>
		<k-ui-example label="selector">
			<k-selector :options="options" />
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
	export default {
		computed: {
			options() {
				return [
					{
						text: "Design",
					},
					{
						text: "Photography",
					},
					{
						text: "Architecture",
					},
				];
			},
		},
	};
</script>
