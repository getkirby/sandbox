<template>
	<k-ui-examples>
		<k-ui-example label="slug">
			<k-slug-inputbox :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="placeholder">
			<k-slug-inputbox
				:value="value"
				placeholder="a-b-c"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="before & after">
			<k-slug-inputbox
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="disabled">
			<k-slug-inputbox
				:disabled="true"
				:value="value"
				before="Before"
				after="After"
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
