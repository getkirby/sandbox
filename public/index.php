<?php

$root = dirname(__DIR__);

require $root . '/kirby/bootstrap.php';
require $root . '/environment.php';

$kirby = new Kirby([
	'options' => [
		'api' => [
			'csrf' => 'dev'
		],
		'cache' => [
			'changes' => [
				'prefix' => 'changes'
			],
			'pages' => [
				'prefix' => 'pages'
			],
			'updates' => [
				'prefix' => 'updates'
			],
			'uuid' => [
				'prefix' => 'uuid'
			]
		],
		'debug' => true,
		'email' => [
			'transport' => [
				'type'     => 'smtp',
				'host'     => '127.0.0.1',
				'port'     => 2525,
				'security' => false,
				'username' => 'sandbox.test',
				'password' => null
			]
		],
		'panel' => [
			'dev' => true
		],
		'updates' => [
			'plugins' => [
				'getkirby/sandbox' => false
			]
		]
	],
	'roots' => [
		'index' => __DIR__
	],
	'routes' => [
		[
			'pattern' => '/env/auth/(:any)',
			'action'  => function ($username) {
				Environment::auth($username);

				if (get('panel') !== null) {
					return go('panel');
				}

				die('The user has been authenticated');
			}
		],
		[
			'pattern' => '/env/install/(:any)',
			'action'  => function (string $env) {
				Environment::install($env);
				die('The environment has been installed');
			}
		],
		[
			'pattern' => '/env/user/(:any)',
			'action'  => function (string $username) {
				Environment::user($username);
				die('The user has been created');
			}
		]
	]
]);

Environment::healthcheck();

echo $kirby->render();
