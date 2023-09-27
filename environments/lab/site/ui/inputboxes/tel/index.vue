<template>
	<k-ui-inputbox-examples :value="value" type="tel" @input="value = $event">
		<k-ui-example label="Disabled Tel Button">
			<k-tel-inputbox :link="false" :value="value" @input="value = $event" />
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
