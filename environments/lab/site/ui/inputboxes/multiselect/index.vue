<template>
	<k-ui-examples>
		<k-ui-example label="multiselect">
			<k-multiselect-inputbox
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-multiselect-inputbox
				:options="options"
				:value="value"
				placeholder="Select something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-multiselect-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-multiselect-inputbox
				:disabled="true"
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="no options">
			<k-multiselect-inputbox
				:value="value"
				accept="options"
				@input="value = $event"
			/>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	data() {
		return {
			value: [],
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
