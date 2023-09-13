<template>
	<k-ui-examples>
		<k-ui-example label="Default">
			<component
				:is="`k-${type}-input`"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Autofocus">
			<component
				:is="`k-${type}-input`"
				:autofocus="true"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Placeholder">
			<component
				:is="`k-${type}-input`"
				:value="value"
				@input="value = $event"
				placeholder="Placeholder text …"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled">
			<component
				:is="`k-${type}-input`"
				:disabled="true"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	props: {
		type: String,
	},
	data() {
		return {
			value: null,
		};
	},
};
</script>
