<?php
$video = $page->file('test-video.mp4');
?>

<style>
	* {
		font-family: system-ui;
		margin: 0;
		padding: 0;
	}

	body {
		padding: 1.5rem;
	}

	h1,
	h2 {
		margin-bottom: 1.5rem;
	}

	dt {
		font-weight: 600;
	}

	dd {
		margin-bottom: 0.5rem;
	}

	section+section {
		margin-top: 2.5rem;
	}

	video {
		max-width: 100%;
		height: auto;
	}
</style>

<h1>HTTP Range Requests</h1>

<section>
	<dl>
		<dt>Filename</dt>
		<dd><?= $video->filename() ?></dd>
		<dt>Size</dt>
		<dd><?= $video->niceSize() ?> (<?= number_format($video->size()) ?> bytes)</dd>
		<dt>MIME type</dt>
		<dd><?= $video->mime() ?> (detected from extension: .<?= $video->extension() ?>)</dd>
		<dt>URL</dt>
		<dd><a href="<?= $video->url() ?>" target="_blank"><?= $video->url() ?></a></dd>
	</dl>
</section>

<section style="display: grid; gap: 2.5rem; grid-template-columns: 1fr 1fr 1fr;">
	<div>
		<h2>preload="metadata"</h2>
		<figure>
			<video controls preload="metadata">
				<source src="<?= $video->mediaUrl() ?>?id=<?= Str::random() ?>" type="<?= $video->mime() ?>">
				Your browser doesn't support video playback.
			</video>
		</figure>
	</div>

	<div>
		<h2>preload="auto"</h2>
		<figure>
			<video controls autoplay muted loop preload="auto">
				<source src="<?= $video->mediaUrl() ?>?id=<?= Str::random() ?>" type="<?= $video->mime() ?>">
				Your browser doesn't support video playback.
			</video>
		</figure>
	</div>

	<div>
		<h2>preload="none"</h2>
		<figure>
			<video controls preload="none">
				<source src="<?= $video->mediaUrl() ?>?id=<?= Str::random() ?>" type="<?= $video->mime() ?>">
				Your browser doesn't support video playback.
			</video>
		</figure>
	</div>
</section>

<section>
	<h2>Look in Network tab for:</h2>
	<ul>
		<li>Request header: <code>Range: bytes=X-Y</code></li>
		<li>Response status: <code>206 Partial Content</code> (or <code>200 OK</code> for full file)</li>
		<li>Response header: <code>Content-Range: bytes X-Y/TOTAL</code></li>
		<li>Response header: <code>Accept-Ranges: bytes</code></li>
		<li>Response header: <code>Content-Type: <?= $video->mime() ?></code></li>
	</ul>
</section>
