<template>
	<k-ui-inputbox-examples :value="value" type="url" @input="value = $event">
		<k-ui-example label="Disabled URL Button">
			<k-url-inputbox :link="false" :value="value" @input="value = $event" />
		</k-ui-example>
	</k-ui-inputbox-examples>
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
