<?php

$root = __DIR__ . '/public';

// https://yourdomain.com/media/super/nice.jpg
if (file_exists($root . '/' . $_SERVER['SCRIPT_NAME']) === true) {
	return false; // serve the requested resource as-is.
}

$_SERVER['SCRIPT_NAME'] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $index = $root . '/index.php');

include $index;
