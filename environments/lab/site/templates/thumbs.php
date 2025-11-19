<?php

use Kirby\Cms\File;
use Kirby\Filesystem\F;
use Kirby\Image\Darkroom;

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

	$driver = Darkroom::factory($driverName, $settings[$driverName] ?? []);
	$name   = $file->name();

	F::copy($file->root(), $root = $file->kirby()->root('index') . '/thumbs/' . $name . '-' . $id . '-' . $driverName . '.jpg', true);

	$driver->process($root, $params);
}

function createThumbs(File $file, array $params, string $id)
{
	createThumb('gd', $file, $params, $id);
	createThumb('im', $file, $params, $id);
	createThumb('imagick', $file, $params, $id);
}

function img(string $name, string $driver, string $id)
{
	return '<img src="/thumbs/landscape-' . $id . '-' . $driver . '.jpg?v=' . time() . '">';
}

$drivers = [
	'gd',
	'im',
	'imagick'
];

?>

<style>
body {
	padding: 3rem;
}
stack {
	display: flex;
	flex-direction: column;
	gap: 3rem;
}
grid {
	display: grid;
	display: flex;
	gap: 3rem;
}
</style>

<h1>Thumbs</h1>

<stack>
	<section>
		<h2>Cropping</h2>
		<?php

		createThumbs($landscape, [
			'crop'   => true,
			'width'  => 300,
			'height' => 300
		], 'crop');

		?>
		<grid>
			<?php foreach ($drivers as $driver): ?>
			<column>
				<h3><?= $driver ?></h3>
				<?= img('landscape', $driver, 'crop') ?>
			</column>
			<?php endforeach ?>
		</grid>
	</section>

	<section>
		<h2>Cropping & Gravity (bottom right)</h2>
		<?php

		createThumbs($landscape, [
			'crop'   => 'bottom right',
			'width'  => 300,
			'height' => 300
		], 'crop-gravity');

		?>
		<grid>
			<?php foreach ($drivers as $driver): ?>
			<column>
				<h3><?= $driver ?></h3>
				<?= img('landscape', $driver, 'crop-gravity') ?>
			</column>
			<?php endforeach ?>
		</grid>
	</section>

	<section>
		<h2>Focus Point (25% 0%)</h2>
		<?php

		createThumbs($landscape, [
			'crop'   => '25% 0%',
			'width'  => 300,
			'height' => 300
		], 'crop-focuspoint');

		?>
		<grid>
			<?php foreach ($drivers as $driver): ?>
			<column>
				<h3><?= $driver ?></h3>
				<?= img('landscape', $driver, 'crop-focuspoint') ?>
			</column>
			<?php endforeach ?>
		</grid>
	</section>
</stack>
