panel.plugin("getkirby/netlify", {
	sections: {
		netlify: {
			template: `
        <section class="k-section">
          <k-button
            icon="plane"
            text="Publish to Netlify"
            theme="positive"
            variant="filled"
            class="k-netlify-cta"
            @click="publish"/>
        </section>
      `,
			methods: {
				publish() {
					this.$api.post("deploy");
					alert("Published");
				},
			},
		},
	},
});
