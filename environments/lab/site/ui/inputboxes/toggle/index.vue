<template>
	<k-ui-examples>
		<k-ui-example label="toggle">
			<k-toggle-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-toggle-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="icon">
			<k-toggle-inputbox
				:value="value"
				before="Before"
				after="After"
				icon="check"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-toggle-inputbox
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
