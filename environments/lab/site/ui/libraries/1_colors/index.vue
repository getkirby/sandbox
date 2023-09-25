<template>
	<k-ui-examples>
		<k-ui-example
			:flex="true"
			label="$library.colors.parse()"
			style="
				--color-preview-size: var(--input-height);
				--color-preview-rounded: var(--input-rounded);
			"
		>
			<div>
				<div class="k-color-preview" :style="{ color: value }"></div>
			</div>
			<k-input type="text" placeholder="Type color …" @input="parse" />

			<div>&rarr;</div>

			<k-box theme="code">{{ parsed || "{}" }}</k-box>
			<div>
				<div
					class="k-color-preview"
					:style="{
						color: parsed !== null ? $library.colors.toString(parsed) : value,
					}"
				/>
			</div>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	data() {
		return {
			parsed: null,
			value: null,
		};
	},
	methods: {
		parse(value) {
			this.value = value;
			this.parsed = this.$library.colors.parse(value);
		},
	},
};
</script>
