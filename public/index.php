<?php

$root = dirname(__DIR__);

require $root . '/kirby/bootstrap.php';
require $root . '/environment.php';

if (get('env') !== null) {
    require $root . '/ui.php';
    die();
}

$kirby = new Kirby([
    'options' => [
        'api' => [
            'csrf' => 'dev'
        ],
        'debug' => true,
        'email' => [
            'transport' => [
                'type' => 'smtp',
                'host' => 'localhost',
                'port' => 1025,
                'security' => false
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

echo $kirby->render();
