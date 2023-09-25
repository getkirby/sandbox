<template>
	<k-ui-examples>
		<k-ui-example :flex="true" label="Default">
			<k-timeoption-input :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example :flex="true" label="Autofocus">
			<k-timeoption-input
				:autofocus="true"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example :flex="true" label="Disabled">
			<k-timeoption-input
				:disabled="true"
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
};
</script>
