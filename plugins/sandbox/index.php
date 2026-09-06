<?php

use Kirby\Cms\App;

load([
	'kirby\\sandbox\\accountswitchdialogcontroller'     => 'src/AccountSwitchDialogController.php',
	'kirby\\sandbox\\environmentcreatedialogcontroller' => 'src/EnvironmentCreateDialogController.php',
	'kirby\\sandbox\\environmentdeletedialogcontroller' => 'src/EnvironmentDeleteDialogController.php',
	'kirby\\sandbox\\environmentitem'                   => 'src/EnvironmentItem.php',
	'kirby\\sandbox\\environmentsviewcontroller'        => 'src/EnvironmentsViewController.php',
	'kirby\\sandbox\\loginviewcontroller'               => 'src/LoginViewController.php'
], __DIR__);

App::plugin('getkirby/sandbox', [
	'areas' => [
		'environments' => require __DIR__ . '/areas/environments.php',
		'login'        => require __DIR__ . '/areas/login.php'
	],
	'commands' => [
		'sandbox:create:changes' => require __DIR__ . '/commands/create/changes.php',
		'sandbox:create:users'   => require __DIR__ . '/commands/create/users.php'
	]
]);
