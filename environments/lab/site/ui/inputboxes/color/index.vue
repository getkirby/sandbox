<template>
	<k-ui-inputbox-examples :value="value" type="color" @input="value = $event">
		<k-ui-example label="Format: rgb">
			<k-color-inputbox :value="value" format="rgb" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Format: hsl">
			<k-color-inputbox :value="value" format="hsl" @input="value = $event" />
		</k-ui-example>
		<k-ui-example label="Picker with options">
			<k-color-inputbox
				:options="options"
				:value="value"
				before="Before"
				after="After"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Mode: options">
			<k-color-inputbox
				:options="options"
				:value="value"
				mode="options"
				@input="value = $event"
			/>
		</k-ui-example>
		<k-ui-example label="Mode: input">
			<k-color-inputbox
				:options="options"
				:value="value"
				mode="input"
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
	computed: {
		options() {
			return [
				{ value: "#F8B195", text: "Sunny rays" },
				{ value: "#F67280", text: "First-love blush" },
				{ value: "#C06C84", text: "Cherry blossom" },
				{ value: "#6C5B7B", text: "Morning gloom" },
				{ value: "#355C7D", text: "Midnight rain" },
			];
		},
	},
};
</script>
