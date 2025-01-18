<?php

if (class_exists('Kirby\Plugin\LicenseStatus') === false) {
	return;
}

Kirby::plugin(
	name: 'plugins/custom-license-status',
	extends: [
		'areas' => [
			'custom-license' => function () {
				return [
					'dialogs' => [
						'license/register' => [
							'load'   => function () {
								return [
									'component' => 'k-text-dialog',
									'props'     => [
										'text' => 'This dialog could be used for registering the custom plugin license.'
									]
									];
							},
							'submit' => function () {
								return true;
							}
						]
					]
				];
			}
		],
	],
	info: [
		'authors' => [
			[
				'name'  => 'Kirby Team',
				'email' => 'team@getkirby.com'
			]
		],
		'version' => '1.0.0',
	],
	license: [
		'name'   => 'Sandbox license',
		'link'   => 'https://getkirby.com',
		'status' => [
			'value'  => 'missing',
			'theme'  => 'purple',
			'label'  => 'Get a license',
			'icon'   => 'smile',
			'dialog' => 'license/register'
		]
	]
);
