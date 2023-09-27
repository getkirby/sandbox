<template>
	<k-ui-inputbox-examples :value="value" type="time" @input="value = $event">
		<k-ui-example label="Display">
			<k-time-inputbox
				:value="value"
				display="hh:mm a"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Disabled Times">
			<k-time-inputbox :times="false" :value="value" @input="value = $event" />
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
