<template>
	<k-ui-examples>
		<k-ui-example label="time">
			<k-time-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-time-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-time-inputbox
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
