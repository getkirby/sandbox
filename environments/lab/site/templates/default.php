<style>

* {
	font-family: system-ui;
	margin: 0;
	padding: 0;
}

body {
	padding: 1.5rem;
}

h1 {
	margin-bottom: 1.5rem;
}

dt {
	font-weight: 600;
}

dd {
	margin-bottom: 1.5rem;
}


</style>

<h1><?= $page->title() ?></h1>

<dl>
	<dt>URL</dt>
	<dd><?= $page->url() ?></dd>
	<dt>UUID</dt>
	<dd><?= $page->uuid() ?></dd>
	<dt>UUID-URL</dt>
	<dd><?= $page->uuid()->toPermalink() ?></dd>
	<dt>Language</dt>
	<dd><?= $kirby->language()->code() ?></dd>
</dl>

