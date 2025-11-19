<?php

use Kirby\Data\Data;

return [
	'description' => 'Create random pages to test the performance of the table layout for the pages section',
	'command' => function ($cli) {

		$kirby = $cli->kirby();
		$kirby->impersonate('admin');

		$pages  = Data::read(__DIR__ . '/_placeholders/pages.json');
		$parent = page('other/page-table');

		foreach ($pages as $page) {
			$parent->createChild([
				'slug'     => $page['slug'],
				'content'  => $page,
				'template' => 'page-table-row'
			]);
		}

		$cli->success(count($pages) . ' pages created');
	}
];
