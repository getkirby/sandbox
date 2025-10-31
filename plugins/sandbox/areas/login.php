<?php

return function ($kirby) {
	return [
		'views' => [
			'login' => [
				'action'  => function () use ($kirby) {
					$system = $kirby->system();
					$status = $kirby->auth()->status();

					return [
						'component' => 'k-login-view',
						'props'     => [
							'methods' => array_keys($system->loginMethods()),
							'pending' => [
								'email'     => $status->email(),
								'challenge' => $status->challenge()
							],
							'value' => [
								'email'    => 'admin@getkirby.com',
								'password' => '12345678'
							]
						],
					];
				}
			]
		]
	];
};
