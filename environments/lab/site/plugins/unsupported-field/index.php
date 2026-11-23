<?php

/**
 * Array-based field definition from a plugin that has not been
 * updated yet. Array-based fields are no longer supported in Kirby 6
 * and get replaced with an error box in the Panel.
 */
Kirby::plugin('plugins/unsupported-field', [
	'fields' => [
		'unsupported' => [
			'props' => [
				'value' => fn (string|array|null $value = null) => Yaml::decode($value)
			],
			'save' => fn ($value) => Yaml::encode($value)
		]
	],
]);
