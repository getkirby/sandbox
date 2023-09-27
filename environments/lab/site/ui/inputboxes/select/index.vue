<template>
	<k-ui-options-inputbox-examples
		:columns="false"
		:info="false"
		:value="value"
		type="select"
		@input="value = $event"
	>
		<template v-slot="{ options }">
			<k-ui-example label="Placeholder">
				<k-select-inputbox
					:options="options"
					:value="value"
					placeholder="Placeholder text…"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Empty: false">
				<k-select-inputbox
					:empty="false"
					:options="options"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Multiple: true">
				<k-select-inputbox
					:multiple="true"
					:options="options"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
		</template>
	</k-ui-options-inputbox-examples>
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
