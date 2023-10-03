<?php

use Kirby\Lab\Snippet;

/**
 * Examples snippet
 */
function examples(string $name, array $data = [], bool $slots = false) {
	return Snippet::factory($name, $data, $slots);

}

/**
 * Placeholder image URL
 */
function picsum(int $width = 300, int $height = null) {
	return 'https://picsum.photos/' . $width . '/' . ($height ?? $width) . '?id=' . uniqid();
}
