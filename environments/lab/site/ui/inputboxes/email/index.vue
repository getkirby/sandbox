<template>
	<k-ui-inputbox-examples :value="value" type="email" @input="value = $event">
		<k-ui-example label="Disabled Email Button">
			<k-email-inputbox :link="false" :value="value" @input="value = $event" />
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
