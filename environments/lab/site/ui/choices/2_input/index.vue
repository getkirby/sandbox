<template>
	<k-ui-examples>
		<k-ui-example :flex="true" label="Default">
			<k-choice-input type="checkbox" label="This is a checkbox" />
			<k-choice-input type="radio" label="This is a radio" />
			<k-choice-input
				type="checkbox"
				variant="toggle"
				label="This is a toggle"
			/>
		</k-ui-example>
		<k-ui-example :flex="true" label="Disabled">
			<k-choice-input
				:disabled="true"
				type="checkbox"
				label="This is a checkbox"
			/>
			<k-choice-input :disabled="true" type="radio" label="This is a radio" />
			<k-choice-input
				:disabled="true"
				type="checkbox"
				variant="toggle"
				label="This is a toggle"
			/>
		</k-ui-example>
		<k-ui-example :flex="true" label="Info">
			<k-choice-input
				type="checkbox"
				label="This is a checkbox"
				info="This is some info text"
			/>
			<k-choice-input
				type="radio"
				label="This is a radio"
				info="This is some info text"
			/>
			<k-choice-input
				type="checkbox"
				variant="toggle"
				label="This is a toggle"
				info="This is some info text"
			/>
		</k-ui-example>
		<k-ui-example :flex="true" label="Info & Disabled">
			<k-choice-input
				:disabled="true"
				type="checkbox"
				label="This is a checkbox"
				info="This is some info text"
			/>
			<k-choice-input
				:disabled="true"
				type="radio"
				label="This is a radio"
				info="This is some info text"
			/>
			<k-choice-input
				:disabled="true"
				type="checkbox"
				variant="toggle"
				label="This is a toggle"
				info="This is some info text"
			/>
		</k-ui-example>
	</k-ui-examples>
</template>
