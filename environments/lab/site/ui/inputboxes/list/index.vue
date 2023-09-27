<template>
	<k-ui-inputbox-examples :value="value" type="list" @input="value = $event">
		<k-ui-example label="Toolbar">
			<k-list-inputbox
				:toolbar="{ inline: false }"
				:value="value"
				placeholder="Write something …"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Toolbar & disabled">
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
