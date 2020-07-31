<?php

$root = dirname(__DIR__);

require $root . '/kirby/bootstrap.php';
require $root . '/environment.php';

if ($env = get('env')) {
    Environment::install($env);
    go();
}

$kirby = new Kirby([
    'options' => [
        'api' => [
            'csrf' => 'dev'
        ],
        'debug' => true,
    ],
    'roots' => [
        'index' => __DIR__
    ],
    'routes' => [
        [
            'pattern' => '/env/(:any)',
            'action'  => function (string $env) {
                Environment::install($env);
                die('The new environment has been installed');
            }
        ]
    ]
]);

echo $kirby->render();
