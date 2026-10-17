<?php

use Kirby\Cms\File;
use Kirby\Cms\Page;
use Kirby\Filesystem\Dir;
use Kirby\Filesystem\F;
use Kirby\Image\Darkroom;
use Kirby\Panel\Assets;
use Kirby\Toolkit\Str;

class ThumbsPage extends Page
{
	/**
	 * Seconds per request for generating thumbs
	 */
	protected const BUDGET = 20;

	/**
	 * Largest acceptable difference of a frame to its reference
	 */
	protected const DIFFERENCE = 0.1;

	protected const FORMATS = ['jpg', 'png', 'gif', 'webp', 'avif'];

	protected const GD = [
		'avif' => IMG_AVIF,
		'gif'  => IMG_GIF,
		'jpg'  => IMG_JPG,
		'png'  => IMG_PNG,
		'webp' => IMG_WEBP,
	];

	/**
	 * Crop positions with their ImageMagick gravity
	 */
	protected const GRAVITIES = [
		'top left'     => 'NorthWest',
		'top'          => 'North',
		'top right'    => 'NorthEast',
		'left'         => 'West',
		'center'       => 'Center',
		'right'        => 'East',
		'bottom left'  => 'SouthWest',
		'bottom'       => 'South',
		'bottom right' => 'SouthEast',
	];

	protected const MIMES = [
		'avif' => 'image/avif',
		'gif'  => 'image/gif',
		'jpg'  => 'image/jpeg',
		'jpeg' => 'image/jpeg',
		'png'  => 'image/png',
		'webp' => 'image/webp',
	];

	protected string|null $cache = null;
	protected array|null $environment = null;
	protected array|null $formats = null;
	protected array $inspections = [];
	protected mixed $mutex = null;
	protected int|float|null $start = null;

	/**
	 * ImageMagick CLI binary
	 */
	protected function bin(): string
	{
		return $this->kirby()->option('thumbs.bin', 'convert');
	}

	/**
	 * Cache folder for the current state
	 */
	public function cache(): string
	{
		if ($this->cache !== null) {
			return $this->cache;
		}

		// parallel requests would overwrite each other's thumbs
		$this->mutex = fopen(sys_get_temp_dir() . '/kirby-thumbs-playground.lock', 'c');
		flock($this->mutex, LOCK_EX);

		$this->start = hrtime(true);

		$base = $this->kirby()->root('index') . '/thumbs';
		$root = $base . '/' . $this->state();

		// drop outdated thumbs
		if (get('refresh') !== null || is_dir($root) === false) {
			Dir::remove($base);
		}

		Dir::make($root);

		return $this->cache = $root;
	}

	/**
	 * Thumb options per case and group
	 */
	public function cases(): array
	{
		$crop    = [];
		$formats = [];

		foreach (array_keys(static::GRAVITIES) as $gravity) {
			$crop[Str::slug($gravity)] = [
				'crop'   => $gravity,
				'width'  => 300,
				'height' => 300
			];
		}

		foreach (static::FORMATS as $format) {
			$formats['to-' . $format] = [
				'width'  => 300,
				'format' => $format
			];
		}

		return [
			'crop'     => $crop,
			'resize'   => [
				'width-height' => ['width' => 300, 'height' => 300],
				'width'        => ['width' => 300],
				'height'       => ['height' => 300],
				'no-upscale'   => ['width' => 2000],
			],
			'effects'  => [
				'grayscale' => ['width' => 300, 'grayscale' => true],
				'blur'      => ['width' => 300, 'blur' => true],
				'sharpen'   => ['width' => 300, 'sharpen' => 50],
				'quality'   => ['width' => 300, 'quality' => 20],
			],
			'formats'  => $formats,
			'pipeline' => [
				'width' => ['width' => 300],
				...$formats
			],
		];
	}

	/**
	 * Generates (unless cached) and checks a thumb
	 */
	public function check(
		File $file,
		string $group,
		string $case,
		string $driver
	): array {
		$options = $this->cases()[$group][$case];
		$format  = $this->format($file, $options);
		$reason  = $this->unsupported($driver, $file, $format);

		if ($reason !== null) {
			return ['unsupported' => $reason, 'issues' => []];
		}

		$dir  = $this->folder($file, $group . '-' . $case, $driver);
		$data = $this->meta($dir);

		if ($data === null) {
			if ($this->isPending() === true) {
				return ['pending' => true, 'issues' => []];
			}

			$data = $this->generate($file, $group, $options, $driver, $dir);
		}

		return $this->result($file, $dir, $options, $driver, $data);
	}

	/**
	 * Most different frame of a thumb compared to its reference
	 */
	protected function difference(
		File $file,
		array $options,
		array $data,
		string $dir
	): array|null {
		// a blur differs by design
		if (($options['blur'] ?? false) !== false || class_exists('Imagick') === false) {
			return null;
		}

		$reference = $this->reference($file, $options, $data, $dir);

		if ($reference === null) {
			return null;
		}

		// JPG fills transparency with black
		$back   = $this->format($file, $options) === 'jpg' ? '#000000' : '#ff00ff';
		$worst  = ['value' => 0, 'frame' => 1];

		try {
			$thumb  = (new Imagick($dir . '/' . $data['file']))->coalesceImages();
			$expect = new Imagick($reference);
			$frames = min($thumb->getNumberImages(), $expect->getNumberImages());

			for ($i = 0; $i < $frames; $i++) {
				$a = $this->flatten($thumb, $i, $back);
				$b = $this->flatten($expect, $i, $back);

				if ($a->getImageGeometry() !== $b->getImageGeometry()) {
					continue;
				}

				$value = $a->compareImages($b, Imagick::METRIC_ROOTMEANSQUAREDERROR)[1];

				if ($value > $worst['value']) {
					$worst = ['value' => round($value, 4), 'frame' => $i + 1];
				}
			}
		} catch (Throwable) {
			return null;
		}

		return $worst;
	}

	/**
	 * Drivers, filtered by `?driver=`
	 */
	public function drivers(): array
	{
		$drivers = array_keys(Darkroom::$types);
		$filter  = get('driver');

		if ($filter !== null) {
			$drivers = array_intersect($drivers, Str::split($filter));
		}

		return array_values($drivers);
	}

	/**
	 * Versions of the image libraries
	 */
	public function environment(): array
	{
		if ($this->environment !== null) {
			return $this->environment;
		}

		$gd      = gd_info();
		$gdTypes = array_filter([
			'avif' => $gd['AVIF Support'] ?? false,
			'gif'  => $gd['GIF Create Support'] ?? false,
			'jpg'  => $gd['JPEG Support'] ?? false,
			'png'  => $gd['PNG Support'] ?? false,
			'webp' => $gd['WebP Support'] ?? false,
		]);

		$this->environment = [
			'PHP'     => PHP_VERSION,
			'GD'      => $gd['GD Version'] . ' · ' . implode(', ', array_keys($gdTypes)),
			'Imagick' => 'not installed',
		];

		if (class_exists('Imagick') === true) {
			$version = Imagick::getVersion()['versionString'];
			$types   = array_intersect(['AVIF', 'GIF', 'HEIC', 'WEBP'], Imagick::queryFormats());

			$this->environment['Imagick'] = implode(' · ', [
				phpversion('imagick'),
				Str::before($version, ' https'),
				implode(', ', $types)
			]);
		}

		exec(escapeshellarg($this->bin()) . ' -version 2>/dev/null', $cli);

		// the AVIF coder lists the libheif version
		$avif = $this->formats()['AVIF'][1] ?? '';
		preg_match('/\(([\d.]+)\)/', $avif, $libheif);

		$this->environment['ImageMagick CLI'] = implode(' · ', array_filter([
			$this->bin(),
			Str::before($cli[0] ?? 'not found', ' https'),
			isset($libheif[1]) === true ? 'libheif ' . $libheif[1] : null
		]));

		return $this->environment;
	}

	/**
	 * Single frame on a solid background
	 */
	protected function flatten(Imagick $image, int $index, string $back): Imagick
	{
		$image->setIteratorIndex($index);

		$frame = $image->getImage();
		$frame->setImagePage(0, 0, 0, 0);
		$frame->setImageBackgroundColor($back);
		$frame = $frame->mergeImageLayers(Imagick::LAYERMETHOD_FLATTEN);
		$frame->transformImageColorspace(Imagick::COLORSPACE_SRGB);

		return $frame;
	}

	/**
	 * Folder of a thumb
	 */
	protected function folder(
		File $file,
		string $case,
		string $driver
	): string {
		return $this->cache() . '/' . Str::slug($file->filename()) . '/' . $case . '/' . $driver;
	}

	/**
	 * Output format of a thumb
	 */
	protected function format(File $file, array $options): string
	{
		return $options['format'] ?? $file->extension();
	}

	/**
	 * Formats of the ImageMagick CLI with mode and description
	 */
	public function formats(): array
	{
		if ($this->formats !== null) {
			return $this->formats;
		}

		$this->formats = [];

		exec(escapeshellarg($this->bin()) . ' -list format 2>/dev/null', $lines);

		foreach ($lines as $line) {
			// `AVIF  HEIC  rw+  AV1 Image File Format (1.23.5)`
			if (preg_match('/^\s*([A-Z0-9-]+)\*?\s+\S+\s+([r-][w-][+-])\s+(.*)$/', $line, $match) === 1) {
				$this->formats[$match[1]] = [$match[2], $match[3]];
			}
		}

		return $this->formats;
	}

	/**
	 * Number of frames in an image
	 */
	public function frames(string $root): int|null
	{
		if (class_exists('Imagick') === true) {
			try {
				$image = new Imagick();
				$image->pingImage($root);
				return $image->getNumberImages();
			} catch (Throwable) {
				return null;
			}
		}

		$identify = dirname($this->bin()) . '/identify';

		if (is_file($identify) === false) {
			$identify = 'identify';
		}

		exec(
			escapeshellarg($identify) . ' -format "%n\n" ' . escapeshellarg($root) . ' 2>/dev/null',
			$output
		);

		return isset($output[0]) === true ? (int)$output[0] : null;
	}

	/**
	 * Generates a thumb and stores the outcome
	 */
	protected function generate(
		File $file,
		string $group,
		array $options,
		string $driver,
		string $dir
	): array {
		Dir::make($dir);

		$start = hrtime(true);
		$data  = match ($group) {
			'pipeline' => $this->pipeline($file, $options, $driver, $dir),
			default    => $this->process($file, $options, $driver, $dir)
		};

		$data['ms'] = round((hrtime(true) - $start) / 1e6);

		if (isset($data['file']) === true) {
			$data['difference'] = $this->difference($file, $options, $data, $dir);
		}

		F::write($dir . '/meta.json', json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE));

		return $data;
	}

	/**
	 * Inspects an image as a browser displays it
	 */
	public function inspect(string $root): array
	{
		$size = @getimagesize($root);
		$info = [
			'width'  => $size[0] ?? null,
			'height' => $size[1] ?? null,
			'mime'   => $size['mime'] ?? F::mime($root),
			'frames' => $this->frames($root),
			'bytes'  => filesize($root),
		];

		// browsers rotate JPGs by their EXIF orientation
		if (
			$info['mime'] === 'image/jpeg' &&
			function_exists('exif_read_data') === true
		) {
			$info['orientation'] = @exif_read_data($root)['Orientation'] ?? 1;

			if ($info['orientation'] >= 5) {
				[$info['width'], $info['height']] = [$info['height'], $info['width']];
			}
		}

		// `avis` = animation, `avif` = still
		if ($info['mime'] === 'image/avif') {
			$info['brand'] = file_get_contents($root, false, null, 8, 4);
		}

		return $info;
	}

	/**
	 * Whether the driver keeps all frames for the format
	 */
	public function isAnimatable(string $driver, string $format): bool
	{
		$class = Darkroom::$types[$driver];

		// branches from before `Darkroom::$animatableTypes`
		if (property_exists($class, 'animatableTypes') === false) {
			return
				$driver !== 'gd' &&
				in_array($format, ['avif', 'gif', 'webp'], true);
		}

		return in_array($format, $class::$animatableTypes, true);
	}

	/**
	 * Whether this request is out of time
	 */
	public function isPending(): bool
	{
		$this->start ??= hrtime(true);

		return hrtime(true) - $this->start > static::BUDGET * 1e9;
	}

	/**
	 * Differences between result and expectation
	 */
	public function issues(array $info, array $expected): array
	{
		$issues = [];
		$mime   = static::MIMES[$expected['format']] ?? null;

		if ($info['mime'] !== $mime) {
			$issues[] = 'is ' . $info['mime'] . ', not ' . $expected['format'];
		}

		if (
			$info['width'] !== $expected['width'] ||
			$info['height'] !== $expected['height']
		) {
			$issues[] = 'expected ' . $expected['width'] . '×' . $expected['height'];
		}

		if (
			$info['frames'] !== null &&
			$info['frames'] !== $expected['frames']
		) {
			$frames   = $expected['frames'] === 1 ? 'frame' : 'frames';
			$issues[] = 'expected ' . $expected['frames'] . ' ' . $frames;
		}

		if (
			($info['brand'] ?? 'avis') !== 'avis' &&
			$info['frames'] > 1
		) {
			$issues[] = 'stills, not an animation: browsers show frame 1 only';
		}

		$difference = $info['difference'] ?? null;

		if ($difference !== null && $difference['value'] > static::DIFFERENCE) {
			$issues[] = 'frame ' . $difference['frame'] . ' differs from the source by ' . round($difference['value'] * 100) . '%';
		}

		if ($expected['stray'] !== []) {
			$shown    = array_slice($expected['stray'], 0, 2);
			$more     = count($expected['stray']) - count($shown);
			$issues[] = 'stray files: ' . implode(', ', $shown) . ($more > 0 ? ' and ' . $more . ' more' : '');
		}

		return $issues;
	}

	/**
	 * Options as readable lines
	 */
	public function lines(array $options): array
	{
		$lines = [];

		foreach ($options as $key => $value) {
			if (is_bool($value) === true) {
				$value = $value === true ? 'true' : 'false';
			}

			$lines[] = $key . ': ' . $value;
		}

		return $lines;
	}

	/**
	 * URL with changed filters
	 */
	public function link(array $change = []): string
	{
		$query = array_filter([
			'source' => get('source'),
			'driver' => get('driver'),
			...$change
		]);

		if ($query === []) {
			return $this->url();
		}

		return $this->url() . '?' . http_build_query($query);
	}

	/**
	 * Stored outcome of a thumb
	 */
	protected function meta(string $dir): array|null
	{
		$meta = $dir . '/meta.json';

		if (is_file($meta) === false) {
			return null;
		}

		return json_decode(F::read($meta), true);
	}

	/**
	 * Generates a thumb via Kirby's `thumb` component
	 */
	protected function pipeline(
		File $file,
		array $options,
		string $driver,
		string $dir
	): array {
		// the component uses the configured driver
		$types      = Darkroom::$types;
		$configured = $this->kirby()->option('thumbs.driver', 'gd');

		Darkroom::$types[$configured] = $types[$driver];

		try {
			$root = $this->kirby()->thumb(
				$file->root(),
				$dir . '/{{ name }}{{ attributes }}.{{ extension }}',
				$options
			);
		} catch (Throwable $e) {
			return ['error' => $e->getMessage()];
		} finally {
			Darkroom::$types = $types;
		}

		return [
			'file' => basename($root),
			...$this->preprocess($file, $options, $driver)
		];
	}

	/**
	 * Target size from the driver
	 */
	protected function preprocess(
		File $file,
		array $options,
		string $driver
	): array {
		$darkroom = Darkroom::factory($driver, $this->settings($driver));
		$options  = $darkroom->preprocess($file->root(), $options);

		return [
			'width'  => $options['width'],
			'height' => $options['height'],
		];
	}

	/**
	 * Generates a thumb directly with the driver
	 */
	protected function process(
		File $file,
		array $options,
		string $driver,
		string $dir
	): array {
		$root = $dir . '/thumb.' . $this->format($file, $options);

		F::copy($file->root(), $root, true);

		try {
			$darkroom = Darkroom::factory($driver, $this->settings($driver));
			$options  = $darkroom->process($root, $options);
		} catch (Throwable $e) {
			F::remove($root);
			return ['error' => $e->getMessage()];
		}

		return [
			'file'   => basename($root),
			'width'  => $options['width'],
			'height' => $options['height'],
		];
	}

	/**
	 * Expected frames, built from the source with the ImageMagick CLI
	 */
	protected function reference(
		File $file,
		array $options,
		array $data,
		string $dir
	): string|null {
		$root = dirname($dir) . '/reference.miff';

		if (is_file($root) === true) {
			return $root;
		}

		$size = $data['width'] . 'x' . $data['height'];
		$args = [escapeshellarg($file->root()), '-auto-orient', '-coalesce'];

		if (is_string($options['crop'] ?? null) === true) {
			$args[] = '-resize ' . escapeshellarg($size . '^');
			$args[] = '-gravity ' . static::GRAVITIES[$options['crop']];
			$args[] = '-extent ' . $size;
		} else {
			$args[] = '-resize ' . escapeshellarg($size . '!');
		}

		if (($options['grayscale'] ?? false) === true) {
			$args[] = '-colorspace gray';
		}

		$args[] = '-colorspace sRGB +repage';

		exec(
			escapeshellarg($this->bin()) . ' ' . implode(' ', $args) . ' ' . escapeshellarg($root) . ' 2>/dev/null',
			$output,
			$code
		);

		return $code === 0 && is_file($root) === true ? $root : null;
	}

	/**
	 * Thumb with its inspection and issues
	 */
	protected function result(
		File $file,
		string $dir,
		array $options,
		string $driver,
		array $data
	): array {
		$format = $this->format($file, $options);
		$root   = isset($data['file']) === true ? $dir . '/' . $data['file'] : null;
		$stray  = array_diff(Dir::read($dir), [$data['file'] ?? null, 'meta.json']);

		if (
			isset($data['error']) === true ||
			$root === null ||
			is_file($root) === false
		) {
			return [
				...$data,
				'issues' => [$data['error'] ?? 'no thumb generated']
			];
		}

		$info               = $this->inspect($root);
		$info['difference'] = $data['difference'] ?? null;
		$expected           = [
			'format' => $format,
			'width'  => $data['width'],
			'height' => $data['height'],
			'frames' => 1,
			'stray'  => array_values($stray),
		];

		if ($this->isAnimatable($driver, $format) === true) {
			$expected['frames'] = $this->source($file)['frames'];
		}

		$path = Str::after($root, $this->kirby()->root('index'));

		return [
			...$data,
			'url'    => $this->kirby()->url('index') . $path . '?v=' . filemtime($root),
			'info'   => $info,
			'issues' => $this->issues($info, $expected),
		];
	}

	/**
	 * Driver settings
	 */
	public function settings(string $driver): array
	{
		if ($driver === 'im') {
			return ['bin' => $this->bin()];
		}

		return [];
	}

	/**
	 * Inspection of a source image
	 */
	public function source(File $file): array
	{
		return $this->inspections[$file->root()] ??= $this->inspect($file->root());
	}

	/**
	 * Source images, filtered by `?source=`
	 */
	public function sources(bool $filtered = true): array
	{
		$groups  = array_keys($this->cases());
		$sources = [];

		foreach ($this->images()->sorted() as $image) {
			$content = $image->content();
			$cases   = $content->get('cases')->split();

			if ($cases === []) {
				$cases = ['resize', 'formats'];
			}

			$sources[$image->filename()] = [
				$content->get('description')->value(),
				array_values(array_intersect($groups, $cases))
			];
		}

		$filter = get('source');

		if ($filtered === true && $filter !== null) {
			$sources = array_intersect_key($sources, array_flip(Str::split($filter)));
		}

		return $sources;
	}

	/**
	 * Hash of everything that influences the thumbs
	 */
	protected function state(): string
	{
		$kirby = $this->kirby();
		$state = [
			md5_file(__FILE__),
			json_encode($this->environment()),
			json_encode($kirby->option('thumbs')),
			$this->bin(),
		];

		// cheaper than hashing contents, still catches every change
		foreach (['src', 'config', 'vendor'] as $folder) {
			$files = new RecursiveIteratorIterator(
				new RecursiveDirectoryIterator(
					$kirby->root('kirby') . '/' . $folder,
					FilesystemIterator::SKIP_DOTS
				)
			);

			foreach ($files as $file) {
				$state[] = $file->getPathname() . $file->getMTime() . $file->getSize();
			}
		}

		foreach ($this->images() as $image) {
			$state[] = $image->filename() . $image->modified();
		}

		return substr(md5(implode('|', $state)), 0, 8);
	}

	/**
	 * URL of the Panel stylesheet
	 */
	public function stylesheet(): string
	{
		$kirby = $this->kirby();

		(new Assets())->link();

		return $kirby->url('media') . '/panel/' . $kirby->versionHash() . '/css/style.min.css';
	}

	/**
	 * Whether the driver can read or write the format
	 */
	public function supports(string $driver, string $format, string $mode): bool
	{
		if ($format === 'jpeg') {
			$format = 'jpg';
		}

		return match ($driver) {
			'gd'      => (imagetypes() & (static::GD[$format] ?? 0)) !== 0,
			'imagick' => class_exists('Imagick') === true && Imagick::queryFormats(strtoupper($format)) !== [],
			'im'      => str_contains($this->formats()[strtoupper($format)][0] ?? '', $mode[0]),
			default   => true
		};
	}

	/**
	 * Why the environment can't handle the formats
	 */
	public function unsupported(string $driver, File $file, string $format): string|null
	{
		$source = $file->extension();

		// libgd has no decoder for animated WebP
		if (
			$driver === 'gd' &&
			$source === 'webp' &&
			$this->source($file)['frames'] > 1
		) {
			return 'gd doesn’t support animated WEBP';
		}

		if ($this->supports($driver, $source, 'read') === false) {
			return $driver . ' doesn’t support ' . strtoupper($source);
		}

		if ($this->supports($driver, $format, 'write') === false) {
			return $driver . ' doesn’t support ' . strtoupper($format);
		}

		return null;
	}
}
