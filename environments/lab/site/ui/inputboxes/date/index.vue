<template>
	<k-ui-inputbox-examples :value="value" type="date" @input="value = $event">
		<k-ui-example label="Display">
			<k-date-inputbox
				:value="value"
				display="YYYY-MM-DD"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled Calendar">
			<k-date-inputbox
				:calendar="false"
				:value="value"
				@input="value = $event"
			/>
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
