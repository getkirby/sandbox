<template>
	<k-ui-examples>
		<k-ui-example label="email">
			<k-email-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-email-inputbox
				:value="value"
				placeholder="info@getkirby.com"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-email-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-email-inputbox
				:disabled="true"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
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
