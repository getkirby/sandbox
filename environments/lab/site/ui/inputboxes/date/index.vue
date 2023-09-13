<template>
	<k-ui-examples>
		<k-ui-example label="date">
			<k-date-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-date-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-date-inputbox
				:value="value"
				:disabled="true"
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
