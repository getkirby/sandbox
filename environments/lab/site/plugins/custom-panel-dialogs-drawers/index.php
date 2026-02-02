<?php

Kirby::plugin('plugins/custom-panel-dialogs-drawers', [
	'areas' => [
		'test' => [
			'drawers' => [
				'test/nested' => [
					'load' => function () {
						return [
							'component' => 'k-test-nested-drawer',
							'props'     => [
								'title' => 'Drawer',
								'time'  => date('Y-m-d H:i:s')
							]

						];
					},
					'submit' => function () {
						return true;
					}
				]
			]
		]
	]
]);
