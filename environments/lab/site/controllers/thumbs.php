<?php

use Kirby\Cms\Page;

/**
 * Generates and checks the thumbs, the template renders them
 */
return function (Page $page) {
	set_time_limit(0);

	// clear the cache, then reload without `refresh`
	if (get('refresh') !== null) {
		$page->cache();
		go($page->link(['refresh' => null]));
	}

	$cases   = $page->cases();
	$drivers = $page->drivers();
	$sources = $page->sources();
	$results = [];
	$summary = [];
	$pending = 0;
	$thumbs  = 0;
	$ms      = 0;

	foreach ($sources as $filename => [$description, $enabled]) {
		$file = $page->image($filename);

		if ($file === null) {
			continue;
		}

		foreach ($enabled as $group) {
			foreach (array_keys($cases[$group]) as $case) {
				foreach ($drivers as $driver) {
					$result = $page->check($file, $group, $case, $driver);

					$results[$filename][$group][$case][$driver] = $result;

					// stored per thumb, so the total survives reloads
					if (isset($result['ms']) === true) {
						$thumbs++;
						$ms += $result['ms'];
					}

					$summary[$filename][$driver] ??= [
						'passed'      => 0,
						'total'       => 0,
						'unsupported' => 0,
						'pending'     => 0
					];

					// pending and unsupported don't count
					if (isset($result['pending']) === true) {
						$summary[$filename][$driver]['pending']++;
						$pending++;
					} elseif (isset($result['unsupported']) === true) {
						$summary[$filename][$driver]['unsupported']++;
					} else {
						$summary[$filename][$driver]['total']++;
						$summary[$filename][$driver]['passed'] += $result['issues'] === [] ? 1 : 0;
					}
				}
			}
		}
	}

	$groups = [
		'crop'     => 'Crop 300×300',
		'resize'   => 'Resize',
		'effects'  => 'Effects',
		'formats'  => 'Output formats',
		'pipeline' => 'Kirby pipeline: thumb component with temp file and filename',
	];

	return [
		'cases'   => $cases,
		'drivers' => $drivers,
		'groups'  => $groups,
		'pending' => $pending,
		'results' => $results,
		'seconds' => round($ms / 1000, 1),
		'sources' => $sources,
		'summary' => $summary,
		'thumbs'  => $thumbs,
	];
};
