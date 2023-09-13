<template>
	<k-ui-examples>
		<k-ui-example label="Default">
			<k-range-input :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Autofocus">
			<k-range-input :autofocus="true" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Disabled">
			<k-range-input :disabled="true" :value="value" @input="value = $event" />
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	data() {
		return {
			value: null,
		};
	},
};
</script>
