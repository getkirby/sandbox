<?php

use Kirby\Cms\File;

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
			'accounts' => [
				'label'  => 'Switch accounts',
				'dialog' => 'accounts/switch',
				'icon' 	 => 'user-switch'
			],
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
	'yaml.handler' => 'symfony',
	'languages' => true,
	'colors' => [
		'#F8B195' => 'Sunny rays',
		'#F67280' => 'First-love blush',
		'#C06C84' => 'Cherry blossom',
		'#6C5B7B' => 'Morning gloom',
		'#355C7D' => 'Midnight rain',
	],
	'thumbs' => [
		'srcsets' => [
			'default' => [300, 600, 900, 1200],
			'small'   => [200, 400],
			'hero'    => [800, 1200, 1600, 2000],
		]
	],
	'routes' => [
		[
			'pattern' => 'uploads',
			'method'  => 'POST|GET',
			'action'  => function () {

                // Make sure a file was uploaded
                if (!isset($_FILES['files'])) {
                    return [
                        'status' => 'error',
                        'message' => 'No file uploaded'
                    ];
                }

                $upload = $_FILES['files'];

                kirby()->impersonate('kirby');

                // Try create a new file
                try {

                    File::create([
                        'parent'   => page('other/frontend-upload'),
                        'source'   => $upload['tmp_name'],
                        'filename' => $upload['name'],
                        'content'  => []
                    ]);

                    return [
                        'status' => 'success',
                        'message' => 'File created succesfully'
                    ];

                } catch (Exception $e) {
                    return [
                        'status' => 'error',
                        'message' => 'There was an error: ' . $e->getMessage()
                    ];
                }
			}
		]
	],
	'updates' => [
		'plugins' => [
			'plugins/*' => false
		]
	]
];
