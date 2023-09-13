<template>
	<k-ui-examples>
		<k-ui-example label="simple options">
			<k-radio-inputbox
				:options="options"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="options with info">
			<k-radio-inputbox
				:options="optionsWithInfo"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="columns">
			<k-radio-inputbox
				:columns="3"
				:options="optionsWithInfo"
				:value="value"
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
				{ text: "Option A", value: "a" },
				{ text: "Option B", value: "b" },
				{ text: "Option C", value: "c" },
			];
		},
		optionsWithInfo() {
			return this.$helper.clone(this.options).map((option) => {
				return {
					...option,
					info: "This is some info text",
				};
			});
		},
	},
};
</script>
