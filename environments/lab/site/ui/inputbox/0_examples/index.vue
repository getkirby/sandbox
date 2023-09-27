<template>
	<k-ui-examples>
		<k-ui-example label="input">
			<k-inputbox type="email">
				<k-inputbox-description position="before" text="Before" slot="before" />
				<k-inputbox-element slot="element">
					<input type="email" style="padding: var(--inputbox-padding)" />
				</k-inputbox-element>
				<k-inputbox-description position="after" text="After" slot="after" />
				<k-inputbox-icon type="email" slot="icon" />
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="input with dropdown">
			<k-inputbox after="After" before="Before" type="email">
				<input type="email" style="padding: var(--inputbox-padding)" />
				<k-inputbox-icon slot="icon">
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
		<k-ui-example label="variant: multiline">
			<k-inputbox type="textarea" variant="multiline">
				<k-toolbar />
				<k-autosize>
					<textarea style="padding: var(--inputbox-padding-multiline)" />
				</k-autosize>
			</k-inputbox>
		</k-ui-example>
		<k-ui-example label="variant: box">
			<k-inputbox type="toggle" variant="box">
				<k-toggle-input />
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
