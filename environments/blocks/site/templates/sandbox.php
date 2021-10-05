<?php

$html = <<<HTML
    <!-- put some HTML here -->
HTML;

$blocks = Kirby\Cms\Blocks::parse($html);

dump($blocks);
