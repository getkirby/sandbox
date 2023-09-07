<template>
	<k-ui-examples>
		<k-ui-example label="tabs">
			<k-tabs :tabs="tabs" />
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	computed: {
		tabs() {
			return [
				{
					name: "content",
					label: "Content",
				},
				{
					name: "settings",
					label: "Settings",
				},
			];
		},
	},
};
</script>
