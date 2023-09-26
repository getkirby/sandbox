import Example from "./components/Example.vue";
import Examples from "./components/Examples.vue";
import FieldExamples from "./components/FieldExamples.vue";
import FieldPreviewExample from "./components/FieldPreviewExample.vue";
import Form from "./components/Form.vue";
import Index from "./components/Index.vue";
import InputExamples from "./components/InputExamples.vue";
import InputboxExamples from "./components/InputboxExamples.vue";
import OptionsFieldExamples from "./components/OptionsFieldExamples.vue";
import OptionsInputExamples from "./components/OptionsInputExamples.vue";
import OptionsInputboxExamples from "./components/OptionsInputboxExamples.vue";
import OutputDialog from "./components/OutputDialog.vue";
import Playground from "./components/Playground.vue";

panel.plugin("getkirby/ui", {
	components: {
		"k-ui-example": Example,
		"k-ui-examples": Examples,
		"k-ui-field-examples": FieldExamples,
		"k-ui-field-preview-example": FieldPreviewExample,
		"k-ui-form": Form,
		"k-ui-index-view": Index,
		"k-ui-input-examples": InputExamples,
		"k-ui-inputbox-examples": InputboxExamples,
		"k-ui-options-field-examples": OptionsFieldExamples,
		"k-ui-options-input-examples": OptionsInputExamples,
		"k-ui-options-inputbox-examples": OptionsInputboxExamples,
		"k-ui-output-dialog": OutputDialog,
		"k-ui-playground-view": Playground,
	},
});
