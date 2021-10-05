<?php

use Kirby\Cms\Blocks;

return function ($page) {
    $blocks = Blocks::parse(get('html'));

    return [
        'blocks' => Blocks::factory($blocks, [
            'parent' => $page
        ])
    ];
};
