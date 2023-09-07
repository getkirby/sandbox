import Example from "./components/Example.vue";
import Examples from "./components/Examples.vue";
import Index from "./components/Index.vue";
import Playground from "./components/Playground.vue";

panel.plugin("getkirby/ui", {
	components: {
		"k-ui-example": Example,
		"k-ui-examples": Examples,
		"k-ui-index-view": Index,
		"k-ui-playground-view": Playground,
	},
});
