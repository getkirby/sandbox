<?php

function csv(string $file, string $delimiter = ','): array {
    $lines = file($file);

    $lines[0] = str_replace("\xEF\xBB\xBF", '', $lines[0]);

    $csv = array_map(function($d) use($delimiter) {
        return str_getcsv($d, $delimiter);
    }, $lines);

    array_walk($csv, function(&$a) use ($csv) {
       $a = array_combine($csv[0], $a);
    });

    array_shift($csv);

    return $csv;
}
