<template>
	<k-ui-examples>
		<k-ui-example label="Default">
			<k-choice-input :checked="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Radio">
			<k-choice-input :checked="value" type="radio" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Toggle">
			<k-choice-input
				:checked="value"
				variant="toggle"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Autofocus">
			<k-choice-input
				:autofocus="true"
				:checked="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled">
			<k-choice-input
				:disabled="true"
				:checked="value"
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
