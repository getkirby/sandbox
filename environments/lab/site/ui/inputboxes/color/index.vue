<template>
	<k-ui-examples>
		<k-ui-example label="color">
			<k-color-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-color-inputbox
				:value="value"
				placeholder="#efefef"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-color-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-color-inputbox
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
