import Example from "./components/Example.vue";
import Examples from "./components/Examples.vue";
import Index from "./components/Index.vue";
import InputExamples from "./components/InputExamples.vue";
import OptionsInputExamples from "./components/OptionsInputExamples.vue";
import Playground from "./components/Playground.vue";

panel.plugin("getkirby/ui", {
	components: {
		"k-ui-example": Example,
		"k-ui-examples": Examples,
		"k-ui-index-view": Index,
		"k-ui-input-examples": InputExamples,
		"k-ui-options-input-examples": OptionsInputExamples,
		"k-ui-playground-view": Playground,
	},
});
