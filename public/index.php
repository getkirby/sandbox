<?php

$root    = dirname(__DIR__);
$config  = $root . '/sandbox.config.php';
$options = [];

require $root . '/kirby/bootstrap.php';
require $root . '/environment.php';

if (is_file($config) === true) {
	$options = require $config;
}

$kirby = new Kirby([
	'options' => array_replace_recursive([
		'api' => [
			'csrf' => 'dev'
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
		],
		'url' => 'https://sandbox.test',
	], $options),
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
