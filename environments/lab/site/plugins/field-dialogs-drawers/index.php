<?php

Kirby::plugin(
	name: 'plugins/field-dialogs-drawers',
	extends: [
		'fields' => [
			'field-with-dialogs-drawers' => [
				'dialogs' => fn () => [
					'test' => [
						'load' => fn () => [
							'component' => 'k-text-dialog',
							'props' => [
								'text' => 'This is a test dialog'
							]
						]
					]
				],
				'drawers' => fn () => [
					'test' => [
						'load' => fn () => [
							'component' => 'k-text-drawer',
							'props' => [
								'text' => 'This is a test drawer'
							]
						]
					]
				]
			]
		]
	]
);
