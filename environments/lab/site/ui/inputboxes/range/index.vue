<template>
	<k-ui-examples>
		<k-ui-example label="range">
			<k-range-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-range-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-range-inputbox
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
