<template>
	<k-ui-examples>
		<k-ui-example label="tags">
			<k-tags-inputbox
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-tags-inputbox
				:options="options"
				:value="value"
				placeholder="Select something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-tags-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-tags-inputbox
				:disabled="true"
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="no options">
			<k-tags-inputbox
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
