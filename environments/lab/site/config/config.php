<?php

return [
	'panel' => [
		'menu' => [
			'site',
			'lab' => ['menu' => true],
			'-',
			'languages',
			'users',
			'system',
			'-',
			'environments',
		],
		'viewButtons' => [
			'site' => [
				'preview',
				'reference' => [
					'props' => [
						'text'   => 'Reference',
						'link'   => 'https://getkirby.com/docs/reference',
						'target' => '_blank',
						'icon'   => 'book'
					]
				],
				'languages',
			]
		]
	],
	'languages' => true,
	'colors' => [
		'#F8B195' => 'Sunny rays',
		'#F67280' => 'First-love blush',
		'#C06C84' => 'Cherry blossom',
		'#6C5B7B' => 'Morning gloom',
		'#355C7D' => 'Midnight rain',
	]
];
