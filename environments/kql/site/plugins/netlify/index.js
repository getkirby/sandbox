panel.plugin("getkirby/netlify", {
  sections: {
    netlify: {
      template: `
        <section>
          <k-button class="k-netlify-cta" @click="publish">Publish to Netlify</k-button>
        </section>
      `,
      methods: {
        publish() {
          this.$api.post("deploy");
          alert("Published");
        }
      }
    }
  }
});
