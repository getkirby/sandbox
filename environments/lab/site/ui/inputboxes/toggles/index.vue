<template>
	<k-ui-options-inputbox-examples
		:columns="false"
		:info="false"
		:placeholder="false"
		:value="value"
		type="toggles"
		@input="value = $event"
	>
		<template v-slot="{ options }">
			<k-ui-example label="Reset: false">
				<k-toggles-inputbox
					:reset="false"
					:options="options"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Options with icons">
				<k-toggles-inputbox
					:options="optionsWithIcons"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Labels: false">
				<k-toggles-inputbox
					:labels="false"
					:options="optionsWithIcons"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Columns: 3">
				<k-toggles-inputbox
					:columns="3"
					:labels="false"
					:options="optionsForColumns"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
			<k-ui-example label="Grow: true">
				<k-toggles-inputbox
					:grow="true"
					:options="optionsWithIcons"
					:value="value"
					@input="value = $event"
				/>
			</k-ui-example>
		</template>
	</k-ui-options-input-examples>
</template>

<script>
export default {
	data() {
		return {
			value: null,
		};
	},
	computed: {
		optionsWithIcons() {
			return [
				{ text: "Left", value: "left", icon: "text-left" },
				{ text: "Center", value: "center", icon: "text-center" },
				{ text: "Right", value: "right", icon: "text-right" },
			];
		},
		optionsForColumns() {
			return [
				"grid-top-left",
				"grid-top",
				"grid-top-right",
				"grid-left",
				"grid",
				"grid-right",
				"grid-bottom-left",
				"grid-bottom",
				"grid-bottom-right",
			].map((item) => {
				return {
					text: item,
					icon: item,
					value: item,
				};
			});
		},
	},
};
</script>
