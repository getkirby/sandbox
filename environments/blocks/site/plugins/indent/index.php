<?php

require_once __DIR__ . '/vendor/autoload.php';

function indent($html) {

    $indenter = new \Gajus\Dindent\Indenter([
        'indentation_character' => '  '
    ]);

    return $indenter->indent($html);
}
