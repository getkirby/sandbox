<template>
	<k-ui-examples>
		<k-ui-example label="Default">
			<k-choice-input :checked="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Label">
			<k-choice-input :checked="value" label="Option" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Label & Info">
			<k-choice-input
				:checked="value"
				info="This is some info text"
				label="Option"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Type: radio">
			<k-choice-input
				:checked="value"
				info="This is some info text"
				label="Option"
				type="radio"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Variant: toggle">
			<k-choice-input
				:checked="value"
				info="This is some info text"
				label="Option"
				variant="toggle"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Autofocus">
			<k-choice-input
				:autofocus="true"
				:checked="value"
				info="This is some info text"
				label="Option"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled">
			<k-choice-input
				:disabled="true"
				:checked="value"
				info="This is some info text"
				label="Option"
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
