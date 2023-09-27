<template>
	<k-ui-form>
		<k-ui-examples>
			<k-ui-example label="Todo App">
				<k-array-input
					ref="todos"
					:min="2"
					:max="5"
					:required="true"
					:value="JSON.stringify(todos)"
					name="todos"
					class="k-todos-input"
					input=".k-text-input"
					@input="update($event.target.selected)"
				>
					<ul v-if="todos.length">
						<li v-for="todo in todos">
							<k-choice-input :label="todo" @input.native.stop="remove(todo)" />
						</li>
					</ul>
					<k-text-input
						ref="input"
						:value="todo"
						placeholder="Add a todo …"
						@input.native.stop="todo = $event.target.value"
						@keydown.native.enter.prevent="add"
					/>
				</k-array-input>
			</k-ui-example>
			<k-ui-example label="Output">
				<k-code>{{ todos }}</k-code>
			</k-ui-example>
		</k-ui-examples>
	</k-ui-form>
</template>

<script>
export default {
	data() {
		return {
			output: null,
			todo: "",
			todos: ["Buy some milk", "Put out the trash"],
		};
	},
	methods: {
		add() {
			this.$refs.todos.add(this.todo);
			this.todo = "";
		},
		update(todos) {
			this.todos = todos;
		},
		remove(todo) {
			this.$refs.todos.remove(todo);
		},
	},
};
</script>

<style>
.k-todos-input {
	display: block;
	border-radius: var(--rounded);
}
.k-todos-input li,
.k-todos-input .k-text-input {
	background: var(--color-white);
	padding: var(--inputbox-padding);
	border-radius: var(--rounded);
	box-shadow: var(--shadow);
}
.k-todos-input li {
	margin-bottom: 2px;
}
.k-todos-input:invalid {
	outline: 2px solid var(--color-red-600);
}
</style>
