<template>
	<k-ui-examples>
		<k-ui-example :flex="true" label="Default">
			<k-choice type="checkbox" />
			<k-choice type="radio" />
			<k-choice type="checkbox" variant="toggle" />
		</k-ui-example>
		<k-ui-example :flex="true" label="Checked">
			<k-choice :checked="true" type="checkbox" />
			<k-choice :checked="true" type="radio" />
			<k-choice :checked="true" type="checkbox" variant="toggle" />
		</k-ui-example>
		<k-ui-example :flex="true" label="Disabled">
			<k-choice :disabled="true" type="checkbox" />
			<k-choice :disabled="true" type="radio" />
			<k-choice :disabled="true" type="checkbox" variant="toggle" />
		</k-ui-example>
		<k-ui-example :flex="true" label="Checked & Disabled">
			<k-choice :checked="true" :disabled="true" type="checkbox" />
			<k-choice :checked="true" :disabled="true" type="radio" />
			<k-choice
				:checked="true"
				:disabled="true"
				type="checkbox"
				variant="toggle"
			/>
		</k-ui-example>
	</k-ui-examples>
</template>
