<template>
	<k-ui-examples>
		<k-ui-example label="number">
			<k-number-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-number-inputbox
				:value="value"
				placeholder="Year"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-number-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-number-inputbox
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
