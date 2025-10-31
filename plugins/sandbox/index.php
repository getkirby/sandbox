<?php

use Kirby\Cms\App;

App::plugin('getkirby/sandbox', [
	'areas' => [
		'login'        => require __DIR__ . '/areas/login.php',
		'environments' => require __DIR__ . '/areas/environments.php'
	],
	'commands' => [
		'sandbox:create:changes' => require __DIR__ . '/commands/create/changes.php',
		'sandbox:create:users'   => require __DIR__ . '/commands/create/users.php'
	]
]);
