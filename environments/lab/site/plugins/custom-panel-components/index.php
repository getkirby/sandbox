<?php

use Kirby\Form\Field\DisplayField;
use Kirby\Form\Field\InfoField;

class ExtendsStringField extends InfoField
{
}

class ExtendsSfcField extends DisplayField
{
}

Kirby::plugin('plugins/custom-panel-components', [
	'fields' => [
		'extendsstring' => ExtendsStringField::class,
		'extendssfc'    => ExtendsSfcField::class,
	],
]);
