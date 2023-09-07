<?php

/**
 * Placeholder image URL
 */
function picsum(int $width = 300, int $height = null) {
	return 'https://picsum.photos/' . $width . '/' . ($height ?? $width) . '?id=' . uniqid();
}
