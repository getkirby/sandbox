<template>
	<k-ui-examples>
		<k-ui-example label="select">
			<k-select-inputbox
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-select-inputbox
				:options="options"
				:value="value"
				placeholder="Select something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-select-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-select-inputbox
				:disabled="true"
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="no options">
			<k-select-inputbox :value="value" @input="value = $event" />
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
	computed: {
		options() {
			return [
				{ text: "Option A", value: "a" },
				{ text: "Option B", value: "b" },
				{ text: "Option C", value: "c" },
			];
		},
	},
};
</script>
