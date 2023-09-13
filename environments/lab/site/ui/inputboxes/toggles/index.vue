<template>
	<k-ui-examples>
		<k-ui-example label="toggles">
			<k-toggles-inputbox
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-toggles-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="icon">
			<k-toggles-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				icon="check"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="grow">
			<k-toggles-inputbox
				:grow="true"
				:options="options"
				:value="value"
				before="Before"
				after="After"
				icon="check"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-toggles-inputbox
				:disabled="true"
				:options="options"
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
	computed: {
		options() {
			return [
				{ text: "Option A", value: "a", icon: "text-left" },
				{ text: "Option B", value: "b", icon: "text-center" },
				{ text: "Option C", value: "c", icon: "text-right" },
			];
		},
	},
};
</script>
