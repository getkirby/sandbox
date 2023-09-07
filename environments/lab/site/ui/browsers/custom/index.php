<?php

return [
	'items' => A::map(range(1, 10), function ($item) {
		return [
			'image' => [
				'src' => picsum(100)
			],
			'label' => 'some-image-' . $item . '.jpg',
			'value' => $item,
		];
	})
];
