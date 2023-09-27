<template>
	<k-ui-inputbox-examples
		:description="false"
		:icon="false"
		:value="value"
		type="textarea"
		@input="value = $event"
	>
		<k-ui-example label="No toolbar">
			<k-textarea-inputbox
				:buttons="false"
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="No toolbar & disabled">
			<k-textarea-inputbox
				:disabled="true"
				:buttons="false"
				:value="value"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Font: monospace">
			<k-textarea-inputbox
				:value="value"
				font="monospace"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Size: small">
			<k-textarea-inputbox
				:value="value"
				size="small"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Size: medium">
			<k-textarea-inputbox
				:value="value"
				size="medium"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Size: large">
			<k-textarea-inputbox
				:value="value"
				size="large"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Size: huge">
			<k-textarea-inputbox :value="value" size="huge" @input="value = $event" />
		</k-ui-example>
	</k-ui-inputbox-examples>
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
