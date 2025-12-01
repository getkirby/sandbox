<?php

use Kirby\Cms\File;
use Kirby\Filesystem\F;
use Kirby\Image\Darkroom;
use Kirby\Image\Gravity;

$landscape = $page->image('landscape.jpg');
$square    = $page->image('square.jpg');
$portrait  = $page->image('portrait.jpg');

function createThumb(string $driverName, File $file, array $params, string $id)
{
	$settings = [
		'im' => [
			'bin' => '/opt/homebrew/bin/convert'
		]
	];

	$driver    = Darkroom::factory($driverName, $settings[$driverName] ?? []);
	$name      = $file->name();
	$extension = 'jpg';

	if ($format = ($params['format'] ?? null)) {
		$extension = $format;
	}

	F::copy($file->root(), $root = $file->kirby()->root('index') . '/thumbs/' . $name . '-' . $id . '-' . $driverName . '.' . $extension, true);

	$driver->process($root, $params);
}

function img(string $name, string $driver, string $id, string $extension = 'jpg')
{
	$url = '/thumbs/' . $name . '-' . $id . '-' . $driver . '.' . $extension . '?v=' . time();
	return '<a href="' . $url . '" target="_blank"><img src="' . $url . '" title="' . $id . '"></a>';
}

$gravities = [
	'top left',
	'top',
	'top right',
	'left',
	'center',
	'right',
	'bottom left',
	'bottom',
	'bottom right',
];

$drivers = [
	'gd',
	'im',
	'imagick'
];

$images = [
	'landscape' => $landscape,
	'portrait'  => $portrait,
	'square'    => $square
];

$driver = 'im';

?>

<style>
* {
	margin: 0;
	padding: 0;
}
h1, h2, h3, h4 {
	margin-bottom: .75rem;
}
body {
	padding: 1.5rem;
	font-family: system-ui;
}
stack {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}
grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: .25rem;
}
grid column a {
	aspect-ratio: 1/1;
	display: grid;
	place-items: center;
	background: #000;
	position: relative;
}
grid img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

drivers {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-gap: 1.5rem;
}

imagetype {
	display: block;
	border: 1px solid #dedede;
	padding: 1.5rem;
	border-radius: .5rem;
}


</style>

<h1>Thumbs</h1>

<drivers>

	<?php foreach ($drivers as $driver): ?>
	<driver>
		<h2>Driver: <?= $driver ?></h2>
		<stack>
			<?php foreach ($images as $imageName => $image): ?>
			<imagetype>
				<stack>
					<section>
						<h3><?=  ucfirst($imageName) ?></h3>
						<grid>
							<column>
								<a href="<?=  $image->url() ?>" target="_blank">
									<img src="<?=  $image->url() ?>">
								</a>
							</column>
						</grid>
					</section>

					<section>
						<h3>Gravities</h3>
						<grid>
							<?php foreach ($gravities as $gravity): ?>
							<?php createThumb($driver, $image, [
								'crop'   => $gravity,
								'width'  => 300,
								'height' => 300
							], $id = 'crop-' . $gravity) ?>
							<column>
								<?= img($imageName, $driver, $id) ?>
							</column>
							<?php endforeach ?>
						</grid>
					</section>

					<section>
						<grid>
							<column>
								<?php createThumb($driver, $image, [
									'width'  => 300,
									'height' => 300
								], $id = 'resize-width-and-height') ?>
								<h3>Resize: w & h</h3>
								<?= img($imageName, $driver, $id) ?>
							</column>
							<column>
								<?php createThumb($driver, $image, [
									'width'  => 300,
								], $id = 'resize-width') ?>
								<h3>Resize: w</h3>
								<?= img($imageName, $driver, $id) ?>
							</column>
							<column>
								<?php createThumb($driver, $image, [
									'height' => 300,
								], $id = 'resize-height') ?>
								<h3>Resize: h</h3>
								<?= img($imageName, $driver, $id) ?>
							</column>
						</grid>
					</section>

					<section>
						<grid>
							<column>
								<?php createThumb($driver, $image, [
									'grayscale' => true,
								], $id = 'grayscale') ?>
								<h3>Grayscale</h3>
								<?= img($imageName, $driver, $id) ?>
							</column>
							<column>
								<?php createThumb($driver, $image, [
									'blur' => true,
								], $id = 'blur') ?>
								<h3>Blur</h3>
								<?= img($imageName, $driver, $id) ?>
							</column>
						</grid>
					</section>

					<section>
						<grid>
							<column>
								<?php createThumb($driver, $image, [
									'format' => 'webp',
								], $id = 'webp') ?>
								<h3>WebP</h3>
								<?= img($imageName, $driver, $id, 'webp') ?>
							</column>
							<?php if ($driver !== 'gd'): ?>
							<column>
								<?php createThumb($driver, $image, [
									'format' => 'avif',
								], $id = 'avif') ?>
								<h3>AVIF</h3>
								<?= img($imageName, $driver, $id, 'avif') ?>
							</column>
							<?php endif ?>
						</grid>
					</section>
				</stack>
			</imagetype>
			<?php endforeach ?>
		</stack>

	</driver>
	<?php endforeach ?>
</drivers>
