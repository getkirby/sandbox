<?php

use Kirby\Filesystem\F;
use Kirby\Image\Darkroom;

/**
 * @var array<string, array<string, array>> $cases
 * @var array<int, string> $drivers
 * @var array<string, string> $groups
 * @var ThumbsPage $page
 * @var int $pending
 * @var array<string, array<string, array<string, array<string, array>>>> $results
 * @var float $seconds
 * @var array<string, array{0: string, 1: array<int, string>}> $sources
 * @var array<string, array<string, array{passed: int, total: int, unsupported: int, pending: int}>> $summary
 * @var int $thumbs
 */

?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thumbs playground</title>
<link rel="stylesheet" href="<?= $page->stylesheet() ?>">
<?php if ($pending > 0): ?>
<meta http-equiv="refresh" content="1">
<?php endif ?>
<style>
/* layout only, everything else comes from the Panel stylesheet */
body {
	padding: var(--spacing-6);
	background: var(--panel-color-back);
	color: var(--color-text);
	line-height: 1.5;
}
h1 { margin-bottom: var(--spacing-6); font-size: var(--text-2xl); font-weight: var(--font-semi); }
h2 { margin-bottom: var(--spacing-3); font-size: var(--text-lg); font-weight: var(--font-semi); }
section { margin-bottom: var(--spacing-12); }
.k-label { margin-bottom: var(--spacing-2); }
h3.k-label { margin-top: var(--spacing-6); }
.k-box { margin-bottom: var(--spacing-6); }
.k-help { margin-bottom: var(--spacing-6); line-height: 1.5; }
.thumb img { outline: 1px dashed var(--color-focus); outline-offset: -1px; }

/* Panel tables give every cell 100% width, fixed columns need `auto` for the rest */
.facts tbody th { width: 12rem; }
.facts td { width: auto; font-family: var(--font-mono); font-size: var(--text-xs); }
.k-table td a { text-decoration: underline; }

.filters { display: grid; grid-template-columns: max-content 1fr; gap: var(--spacing-3) var(--spacing-6); align-items: baseline; padding: var(--spacing-3); background: var(--item-color-back); box-shadow: var(--shadow); border-radius: var(--rounded); }

.k-table td[data-theme] { color: var(--theme-color-text); font-weight: var(--font-semi); }
.cases td { padding-block: var(--spacing-2); vertical-align: top; }
.cases td[data-theme] { font-weight: normal; color: inherit; box-shadow: inset 3px 0 0 var(--theme-color-border); }
.cases .options { width: 11rem; }
.cases :where(th, td):not(.options) { width: auto; }
.cases code { display: block; font-size: var(--text-xs); color: var(--color-text-dimmed); }

.source { display: flex; gap: var(--spacing-6); align-items: flex-start; margin-bottom: var(--spacing-6); }
.source .k-stats { flex-grow: 1; }
.thumb { display: inline-block; background: var(--color-black) var(--pattern); line-height: 0; vertical-align: top; }
.thumb img { display: block; max-width: 100%; max-height: 200px; }
.source .thumb img { max-height: 160px; }
.meta { margin-top: var(--spacing-2); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-dimmed); }
.unsupported { font-size: var(--text-xs); font-weight: normal; color: var(--color-text-dimmed); }
.issue { margin-top: var(--spacing-1); font-size: var(--text-xs); font-weight: var(--font-semi); color: var(--theme-color-text); overflow-wrap: anywhere; }
</style>
</head>
<body>

<h1>Thumbs playground</h1>

<?php if ($pending > 0): ?>
<p class="k-box" data-theme="notice">Generating thumbs: <?= $pending ?> still pending, the page reloads by itself</p>
<?php endif ?>

<section>
	<h2 class="k-label"><span class="k-label-text">Environment</span></h2>
	<div class="k-table facts">
		<table>
			<?php foreach ($page->environment() as $key => $value): ?>
			<tr><th><?= esc($key) ?></th><td><?= esc($value) ?></td></tr>
			<?php endforeach ?>
			<tr>
				<th>cache</th>
				<td>
					<?= basename($page->cache()) ?> ·
					<?= $thumbs ?> thumbs, generated in <?= $seconds ?>s ·
					<a href="<?= $page->link(['refresh' => 1]) ?>">regenerate all</a>
				</td>
			</tr>
		</table>
	</div>
</section>

<section>
	<h2 class="k-label"><span class="k-label-text">Filters</span></h2>
	<div class="filters">
		<span class="k-label">Sources</span>
		<nav class="k-button-group">
			<a class="k-button" data-variant="filled" data-size="sm" data-has-text="true" href="<?= $page->link(['source' => null]) ?>" <?= get('source') ? '' : 'aria-current="true" data-theme="info"' ?>><span class="k-button-text">all</span></a>
			<?php foreach (array_keys($page->sources(false)) as $filename): ?>
			<a class="k-button" data-variant="filled" data-size="sm" data-has-text="true" href="<?= $page->link(['source' => $filename]) ?>" <?= get('source') === $filename ? 'aria-current="true" data-theme="info"' : '' ?>><span class="k-button-text"><?= esc($filename) ?></span></a>
			<?php endforeach ?>
		</nav>

		<span class="k-label">Drivers</span>
		<nav class="k-button-group">
			<a class="k-button" data-variant="filled" data-size="sm" data-has-text="true" href="<?= $page->link(['driver' => null]) ?>" <?= get('driver') ? '' : 'aria-current="true" data-theme="info"' ?>><span class="k-button-text">all</span></a>
			<?php foreach (array_keys(Darkroom::$types) as $driver): ?>
			<a class="k-button" data-variant="filled" data-size="sm" data-has-text="true" href="<?= $page->link(['driver' => $driver]) ?>" <?= get('driver') === $driver ? 'aria-current="true" data-theme="info"' : '' ?>><span class="k-button-text"><?= esc($driver) ?></span></a>
			<?php endforeach ?>
		</nav>
	</div>
</section>

<section>
	<h2 class="k-label"><span class="k-label-text">Checks</span></h2>
	<div class="k-table">
		<table>
			<thead>
				<tr>
					<th>Source</th>
					<?php foreach ($drivers as $driver): ?>
					<th><?= esc($driver) ?></th>
					<?php endforeach ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($summary as $filename => $counts): ?>
				<tr>
					<td><a href="#<?= esc($filename, 'attr') ?>"><?= esc($filename) ?></a></td>
					<?php foreach ($drivers as $driver): ?>
					<?php ['passed' => $passed, 'total' => $total, 'unsupported' => $unsupported, 'pending' => $waiting] = $counts[$driver] ?>
					<td data-theme="<?= $passed < $total ? 'negative' : ($unsupported > 0 ? 'passive' : 'positive') ?>">
						<?= $passed ?> / <?= $total + $unsupported + $waiting ?>
						<?php if ($unsupported > 0): ?>
						<span class="unsupported">· <?= $unsupported ?> unsupported</span>
						<?php endif ?>
						<?php if ($waiting > 0): ?>
						<span class="unsupported">· <?= $waiting ?> pending</span>
						<?php endif ?>
					</td>
					<?php endforeach ?>
				</tr>
				<?php endforeach ?>
			</tbody>
		</table>
	</div>
</section>

<?php foreach ($results as $filename => $sourceGroups): ?>
<?php $file = $page->image($filename) ?>
<?php $info = $page->source($file) ?>
<section id="<?= esc($filename, 'attr') ?>">
	<h2><?= esc($filename) ?></h2>
	<p class="k-help"><?= esc($sources[$filename][0]) ?></p>

	<div class="source">
		<a class="thumb" href="<?= $file->url() ?>" target="_blank"><img src="<?= $file->url() ?>" alt=""></a>
		<dl class="k-stats" data-size="small">
			<div class="k-stat"><dt class="k-stat-label">type</dt><dd class="k-stat-value"><?= esc($info['mime']) ?></dd></div>
			<div class="k-stat"><dt class="k-stat-label">size</dt><dd class="k-stat-value"><?= $info['width'] ?>×<?= $info['height'] ?></dd></div>
			<div class="k-stat"><dt class="k-stat-label">frames</dt><dd class="k-stat-value"><?= $info['frames'] ?? '?' ?></dd></div>
			<div class="k-stat"><dt class="k-stat-label">file</dt><dd class="k-stat-value"><?= F::niceSize($info['bytes']) ?></dd></div>
			<?php if (($info['orientation'] ?? 1) !== 1): ?>
			<div class="k-stat"><dt class="k-stat-label">EXIF orientation</dt><dd class="k-stat-value"><?= $info['orientation'] ?></dd></div>
			<?php endif ?>
		</dl>
	</div>

	<?php foreach ($sourceGroups as $group => $groupCases): ?>
	<h3 class="k-label"><span class="k-label-text"><?= esc($groups[$group]) ?></span></h3>
	<div class="k-table cases">
		<table>
			<thead>
				<tr>
					<th class="options">Options</th>
					<?php foreach ($drivers as $driver): ?>
					<th><?= esc($driver) ?></th>
					<?php endforeach ?>
				</tr>
			</thead>
			<tbody>
				<?php foreach ($groupCases as $case => $driverResults): ?>
				<tr>
					<td class="options">
						<?php foreach ($page->lines($cases[$group][$case]) as $line): ?>
						<code><?= esc($line) ?></code>
						<?php endforeach ?>
					</td>
					<?php foreach ($driverResults as $result): ?>
					<?php $theme = isset($result['unsupported']) === true ? 'passive' : ($result['issues'] === [] ? null : 'negative') ?>
					<td <?= $theme ? 'data-theme="' . $theme . '"' : '' ?>>
						<?php if (isset($result['pending']) === true): ?>
						<p class="unsupported">generating …</p>
						<?php elseif (isset($result['unsupported']) === true): ?>
						<p class="unsupported"><?= esc($result['unsupported']) ?></p>
						<?php elseif (isset($result['url']) === true): ?>
						<a class="thumb" href="<?= $result['url'] ?>" target="_blank"><img src="<?= $result['url'] ?>" alt=""></a>
						<p class="meta">
							<?= $result['info']['width'] ?>×<?= $result['info']['height'] ?>
							· <?= $result['info']['frames'] ?? '?' ?> fr
							· <?= F::niceSize($result['info']['bytes']) ?>
							· <?= $result['ms'] ?> ms
						</p>
						<?php endif ?>
						<?php foreach ($result['issues'] as $issue): ?>
						<p class="issue"><?= esc($issue) ?></p>
						<?php endforeach ?>
					</td>
					<?php endforeach ?>
				</tr>
				<?php endforeach ?>
			</tbody>
		</table>
	</div>
	<?php endforeach ?>
</section>
<?php endforeach ?>

</body>
</html>
