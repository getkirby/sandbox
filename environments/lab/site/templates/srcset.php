<?php

$images = [
	'Landscape' => $page->image('landscape.jpg'),
	'Portrait'  => $page->image('portrait.jpg'),
	'Square'    => $page->image('square.jpg'),
];

$scenarios = [
	[
		'title' => 'Simple Width Arrays',
		'code'  => <<<'CODE'
$image->srcset([
	300,
	600,
	900,
	1200
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([300, 600, 900, 1200]);
		},
		'sizes' => '(max-width: 900px) 100vw, 900px',
	],
	[
		'title' => 'Pixel Density Descriptors',
		'code'  => <<<'CODE'
$image->srcset([
	800  => '1x',
	1600 => '2x'
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				800  => '1x',
				1600 => '2x',
			]);
		},
	],
	[
		'title' => 'Explicit Width with Options',
		'code'  => <<<'CODE'
$image->srcset([
	'400w'  => ['width' => 400],
	'800w'  => ['width' => 800],
	'1200w' => ['width' => 1200]
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				'400w'  => ['width' => 400],
				'800w'  => ['width' => 800],
				'1200w' => ['width' => 1200],
			]);
		},
		'sizes' => '(max-width: 900px) 100vw, 900px',
	],
	[
		'title' => 'Cropped Srcset (fixed aspect ratio)',
		'code'  => <<<'CODE'
$image->srcset([
	'1x' => [
		'width'  => 200,
		'height' => 200,
		'crop'   => 'center'
	],
	'2x' => [
		'width'  => 400,
		'height' => 400,
		'crop'   => 'center'
	]
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				'1x' => ['width' => 200, 'height' => 200, 'crop' => 'center'],
				'2x' => ['width' => 400, 'height' => 400, 'crop' => 'center'],
			]);
		},
	],
	[
		'title' => 'Format Conversion (WebP)',
		'code'  => <<<'CODE'
$image->srcset([
	'400w' => [
		'width'  => 400,
		'format' => 'webp'
	],
	'800w' => [
		'width'  => 800,
		'format' => 'webp'
	]
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				'400w' => ['width' => 400, 'format' => 'webp'],
				'800w' => ['width' => 800, 'format' => 'webp'],
			]);
		},
		'sizes' => '(max-width: 800px) 100vw, 800px',
	],
	[
		'title' => 'Format Conversion (AVIF)',
		'code'  => <<<'CODE'
$image->srcset([
	'400w' => [
		'width'  => 400,
		'format' => 'avif'
	],
	'800w' => [
		'width'  => 800,
		'format' => 'avif'
	]
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				'400w' => ['width' => 400, 'format' => 'avif'],
				'800w' => ['width' => 800, 'format' => 'avif'],
			]);
		},
		'sizes' => '(max-width: 800px) 100vw, 800px',
	],
	[
		'title' => 'Config Presets',
		'code'  => '$image->srcset(\'default\')',
		'call'  => function ($image) {
			return $image->srcset('default');
		},
		'sizes' => '(max-width: 900px) 100vw, 900px',
	],
	[
		'title' => 'Quality Variations',
		'code'  => <<<'CODE'
$image->srcset([
	'400w' => [
		'width'   => 400,
		'quality' => 60
	],
	'800w' => [
		'width'   => 800,
		'quality' => 80
	]
])
CODE,
		'call'  => function ($image) {
			return $image->srcset([
				'400w' => ['width' => 400, 'quality' => 60],
				'800w' => ['width' => 800, 'quality' => 80],
			]);
		},
		'sizes' => '(max-width: 800px) 100vw, 800px',
	],
];

?>

<style>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}
body {
	margin: 0;
	padding: 1.5rem;
	font-family: system-ui;
	background: #efefef;
}

h1, h2, h3, h4 {
	margin-bottom: .75rem;
}

.image {
	margin-top: 3rem;
}

section {
	margin-bottom: 3rem;
}
.scenarios {
	background: #fff;
	border-radius: .5rem;
}
.scenario {
	display: grid;
	grid-template-columns: minmax(0, 20rem) minmax(0, 1fr) 20rem;
	gap: 1.5rem;
	padding: 1.5rem;
}
.scenario > div {
	display: flex;
	flex-direction: column;
}
pre {
	background: #000;
	color: #fff;
	padding: .75rem;
	border-radius: .5rem;
	overflow-x: auto;
	tab-size: 4;
	line-height: 1.5;
	font-size: .875rem;
	font-family: monospace;
	flex-grow: 1;
}
pre.srcset {
	background: #efefef;
	color: #000;
}
img.preview {
	width: 100%;
	aspect-ratio: 1/1;
	display: block;
	object-fit: contain;
	background: #000;
	border-radius: .5rem;
	overflow: hidden;
}
</style>

<h1>Srcset Playground</h1>

<?php foreach ($images as $label => $image): ?>
	<?php if ($image === null): ?>
		<?php continue ?>
	<?php endif ?>

	<div class="image">
		<h2><?= $label ?> (<?= $image->dimensions() ?>px)</h2>

		<section class="scenarios">

			<?php foreach ($scenarios as $scenario): ?>
				<?php $srcset = $scenario['call']($image); ?>
				<div class="scenario">
					<div>
						<h3><?= $scenario['title'] ?></h3>
						<pre><code><?= esc($scenario['code']) ?></code></pre>
					</div>
					<div>
						<h3>Srcset</h3>
						<pre class="srcset"><code><?= esc(str_replace(['https://sandbox.test', ', '], ['', ",\n"], $srcset)) ?></code></pre>
					</div>
					<div>
						<h3>Preview</h3>
						<img
							class="preview"
							src="<?= $image->url() ?>"
							srcset="<?= esc($srcset ?? '') ?>"
							<?php if (empty($scenario['sizes']) === false): ?>
								sizes="<?= esc($scenario['sizes']) ?>"
							<?php endif ?>
							alt="<?= $label ?> - <?= $scenario['title'] ?>"
							loading="lazy"
						>
					</div>
				</div>
			<?php endforeach ?>
		</section>
	</div>
<?php endforeach ?>
