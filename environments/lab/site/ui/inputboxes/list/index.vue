<template>
	<k-ui-examples>
		<k-ui-example label="list">
			<k-list-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-list-inputbox
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="toolbar">
			<k-list-inputbox
				:toolbar="{ inline: false }"
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-list-inputbox
				:disabled="true"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="toolbar & disabled">
			<k-list-inputbox
				:disabled="true"
				:toolbar="{ inline: false }"
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
