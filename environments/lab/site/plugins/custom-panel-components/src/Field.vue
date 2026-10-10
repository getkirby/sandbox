<template>
	<k-field :label="label">
		<k-box
			icon="check"
			text="This field is extended from a Vue SFC"
			theme="positive"
		/>
	</k-field>
</template>

<script>
export default {
	props: {
		label: String
	}
};
</script>
