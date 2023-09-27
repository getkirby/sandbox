<template>
	<k-ui-inputbox-examples :description="false" :icon="false" :value="value" type="writer" @input="value = $event">
		<k-ui-example label="Toolbar">
			<k-writer-inputbox
				:toolbar="{ inline: false }"
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Toolbar & disabled">
			<k-writer-inputbox
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
