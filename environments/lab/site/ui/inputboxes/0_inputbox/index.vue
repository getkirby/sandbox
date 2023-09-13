<template>
	<k-ui-examples>
		<k-ui-example label="input">
			<k-inputbox type="email">
				<k-inputbox-description position="before" text="Before" />
				<k-inputbox-element>
					<input type="email" style="padding: var(--input-padding)" />
				</k-inputbox-element>
				<k-inputbox-description position="after" text="After" />
				<k-inputbox-icon type="email" />
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="input with dropdown">
			<k-inputbox type="email">
				<k-inputbox-description position="before" text="Before" />
				<k-inputbox-element>
					<input type="email" style="padding: var(--input-padding)" />
				</k-inputbox-element>
				<k-inputbox-description position="after" text="After" />
				<k-inputbox-icon>
					<k-button
						icon="calendar"
						class="k-inputbox-icon-button"
						@click="$refs.calendar.toggle()"
					/>
					<k-dropdown-content ref="calendar">
						<k-calendar />
					</k-dropdown-content>
				</k-inputbox-icon>
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="input with custom button">
			<k-inputbox type="link">
				<k-inputbox-description
					position="before"
					style="padding-inline-start: var(--spacing-1)"
				>
					<k-button
						variant="filled"
						theme="passive"
						icon="url"
						size="sm"
						text="URL"
						:dropdown="true"
						style="border-radius: var(--rounded-sm)"
					/>
				</k-inputbox-description>
				<k-inputbox-element>
					<input type="email" style="padding: var(--input-padding)" />
				</k-inputbox-element>
				<k-inputbox-description position="after" text="After" />
				<k-inputbox-icon type="bars" />
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="variant: multiline">
			<k-inputbox type="textarea" variant="multiline">
				<k-toolbar />
				<k-autosize>
					<textarea style="padding: var(--input-padding-multiline)" />
				</k-autosize>
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="variant: box">
			<k-inputbox type="toggle" variant="box">
				<k-inputbox-element
					slot="element"
					style="padding-inline: var(--input-padding)"
				>
					<k-choice type="checkbox" variant="toggle" />
				</k-inputbox-element>
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="variant: choices">
			<k-inputbox type="checkboxes" variant="choices">
				<k-checkboxes-input :columns="3" :options="optionsWithInfo" />
			</k-inputbox>
		</k-ui-example>
	</k-ui-examples>
</template>

<script>
export default {
	computed: {
		options() {
			return [
				{ text: "Option A", value: "a" },
				{ text: "Option B", value: "b" },
				{ text: "Option C", value: "c" },
			];
		},
		optionsWithInfo() {
			return this.$helper.clone(this.options).map((option) => {
				return {
					...option,
					info: "This is some info text",
				};
			});
		},
	},
};
</script>
