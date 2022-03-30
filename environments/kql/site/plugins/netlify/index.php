<?php

Kirby::plugin('getkirby/netlify', [
    'sections' => [
        'netlify' => []
    ],
    'api' => [
        'routes' => [
            [
                'pattern' => 'deploy',
                'method'  => 'POST',
                'action'  => function () {
                    Remote::post('https://api.netlify.com/build_hooks/5e1f42129b1e25112d194f8a');

                    return true;
                }
            ]
        ]
    ]
]);
