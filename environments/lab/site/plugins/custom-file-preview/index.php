<?php

use Kirby\Cms\File;

Kirby::plugin('getkirby/custom-file-preview', [
	'filePreviews' => [
		function (File $file) {
			if ($file->extension() === 'glb') {
				return [
					'component' => 'k-file-glb-preview',
					'props' => [
						'asset' => $file->kirby()->plugin('getkirby/custom-file-preview')->asset('model-viewer.min.js')->mediaUrl()
					]
				];
			}
		}
	]
]);
