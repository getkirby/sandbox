# Writer crashes when a plugin node has no `schema`

## Description

In v6, a writer field crashes as soon as one of its `nodes` is a plugin node that doesn't define a `schema`. The editor doesn't render at all, the browser console logs a `TypeError`, and the Panel opens an error dialog.

This worked in v5. There, the base `Node` class returned an empty spec (`{}`) as the default schema, so schema-less plugin nodes (e.g. nodes that only add a toolbar button with a command) were valid.

**Expected behavior**
The writer renders, and the node without a schema behaves as it did in v5 (an empty node spec).

**Screenshots**
<!-- optional: the writer field without editor and the error dialog -->

## To reproduce

1. Register a writer node without a `schema` in a Panel plugin:

   ```js
   panel.plugin("test/writer-node", {
   	writerNodes: {
   		marker: {
   			get button() {
   				return {
   					icon: "bookmark",
   					label: "Mark",
   					inline: true
   				};
   			},
   			commands() {
   				return () => alert("Bookmarked");
   			},
   			get name() {
   				return "marker";
   			}
   		}
   	}
   });
   ```

2. Use it in a writer field:

   ```yaml
   fields:
     text:
       type: writer
       nodes:
         - paragraph
         - marker
   ```

3. Open the page in the Panel.
4. The writer field shows no editor, and the error dialog shows `Cannot read properties of undefined (reading 'group')`.

Nodes from plugins that do define a `schema` work fine, with or without `paragraph`.

The sandbox lab reproduces this out of the box: open the Writer field page (`fields/writer`) and switch to the "Nodes" tab. The "Custom Nodes" field uses the `marker` node from the `custom-writer-node` plugin.

## Cause

Commit 45e380574 ("refact: Migrate Editor `Mark` and `Node` to TS") replaced the default schema getter in v5's `Node.js`:

```js
get schema() {
	return {};
}
```

with an abstract getter in `panel/src/components/Forms/Writer/Node.ts`:

```ts
abstract get schema(): NodeSpec;
```

An abstract getter doesn't generate any code. Plugin nodes are created with `Object.create(Node.prototype, …)` in `createExtensionsFromPlugins()` (`panel/src/helpers/writer.ts`). That bypasses the TypeScript checks, so a node without a `schema` now returns `undefined`. `Extensions.nodes` passes that `undefined` on as the node spec, and ProseMirror's `Schema` constructor fails when it reads `spec.group`.

The same commit made `Mark.schema` abstract in `Mark.ts`, so plugin marks without a `schema` are probably affected as well (not verified). The commit also added a schema to the built-in `Clear` mark, which suggests built-in extensions were adjusted but plugin extensions were not.

**Possible fix**
Restore the defaults for plugin extensions, either by:

- keeping a concrete default getter in `Node.ts` (`return {}`) and `Mark.ts`, or
- falling back to an empty schema in `createExtensionsFromPlugins()` when a plugin doesn't provide one.

## Your setup

**Kirby Version**
6.0.0-rc.1 (`v6/develop`, 2bccf4763)

**Console output**

```
TypeError: Cannot read properties of undefined (reading 'group')
    at new e (media/panel/…/js/vendor.min.js:2:4126)
    at e.compile (media/panel/…/js/vendor.min.js:2:6155)
    at new Ne (media/panel/…/js/vendor.min.js:2:7673)
    at Qd.createSchema (media/panel/…/js/index.min.js:3:153223)
    at new Qd (media/panel/…/js/index.min.js:3:150692)
    at Proxy.mounted (media/panel/…/js/index.min.js:3:159395)
```

**Your system (please complete the following information)**
 - Device: Mac
 - OS: macOS 15.5
 - Browser: Chromium (Playwright headless shell)
 - Version: 159

**Additional context**
Found with the new Playwright e2e tests in the sandbox (`e2e/fields/writer.spec.ts`), which mark this case as an expected failure for now.
