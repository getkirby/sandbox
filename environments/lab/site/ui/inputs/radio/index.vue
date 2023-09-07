<template>
	<k-ui-examples>
		<k-ui-example label="no options">
			<k-input type="radio" />
		</k-ui-example>
		<k-ui-example label="simple options">
			<k-input type="radio" :options="options" name="test" />
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	computed: {
		options() {
			return [
				{ text: "Option A", value: "a" },
				{ text: "Option B", value: "b" },
				{ text: "Option C", value: "c" }
			];
		}
	}
};
</script>

