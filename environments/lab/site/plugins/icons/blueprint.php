<?php

use Kirby\Panel\Assets;

$assets = new Assets();
$file   = $assets->icons();
$svg    = new SimpleXMLElement($file);

$fields = [];

foreach ($svg->defs->children() as $symbol) {
	$slug = str_replace('icon-', '', $symbol->attributes()->id);
	$fields[$slug] = [
		'type'  => 'info',
		'icon'  => $slug,
		'text'  => $slug,
		'label' => false,
		'width' => '1/5',
		'theme' => 'none'
	];
}



return [
	'fields' => $fields
];