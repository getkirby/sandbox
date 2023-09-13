<template>
	<k-ui-examples>
		<k-ui-example label="textarea">
			<k-textarea-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-textarea-inputbox
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="no toolbar">
			<k-textarea-inputbox
				:buttons="false"
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-textarea-inputbox
				:disabled="true"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="no toolbar & disabled">
			<k-textarea-inputbox
				:disabled="true"
				:buttons="false"
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
