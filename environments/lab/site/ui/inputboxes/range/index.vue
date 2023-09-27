<template>
	<k-ui-inputbox-examples :placeholder="false" :value="value" type="range" @input="value = $event">
		<k-ui-example label="Step: 0.01">
			<k-range-inputbox :step="0.01" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Min: 5">
			<k-range-inputbox :min="5" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Max: 10">
			<k-range-inputbox :max="10" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Tooltip: before">
			<k-range-inputbox :tooltip="{ before: '€'}" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Tooltip: before & after">
			<k-range-inputbox :tooltip="{ before: 'just', after: '€'}" :value="value" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Tooltip: false">
			<k-range-inputbox :tooltip="false" :value="value" @input="value = $event" />
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

