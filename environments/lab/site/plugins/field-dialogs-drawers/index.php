<?php

use Kirby\Form\Field\DisplayField;

class DialogsDrawersField extends DisplayField
{
	public function dialogs(): array
	{
		return [
			'test' => [
				'load' => fn () => [
					'component' => 'k-text-dialog',
					'props' => [
						'text' => 'This is a test dialog'
					]
				]
			]
		];
	}

	public function drawers(): array
	{
		return [
			'test' => [
				'load' => fn () => [
					'component' => 'k-text-drawer',
					'props' => [
						'text' => 'This is a test drawer'
					]
				]
			]
		];
	}
}

Kirby::plugin(
	name: 'plugins/field-dialogs-drawers',
	extends: [
		'fields' => [
			'dialogsdrawers' => DialogsDrawersField::class
		]
	]
);
