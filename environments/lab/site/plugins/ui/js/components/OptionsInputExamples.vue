<template>
	<k-ui-examples>
		<k-ui-example label="Default">
			<component
				:is="`k-${type}-input`"
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example v-if="info" label="Options with info">
			<component
				:is="`k-${type}-input`"
				:options="optionsWithInfo"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Autofocus">
			<component
				:is="`k-${type}-input`"
				:autofocus="true"
				:options="optionsWithInfo"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled">
			<component
				:is="`k-${type}-input`"
				:disabled="true"
				:options="optionsWithInfo"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	props: {
		info: {
			default: true,
			type: Boolean,
		},
		type: String,
	},
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
		optionsWithInfo() {
			return [
				{ text: "Option A", value: "a", info: "This is some info text" },
				{ text: "Option B", value: "b", info: "This is some info text" },
				{ text: "Option C", value: "c", info: "This is some info text" },
			];
		},
	},
};
</script>
