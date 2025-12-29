<?php

use Kirby\Panel\Controller\View\LoginViewController;

return function () {
	return [
		'views' => [
			'login' => [
				'action'  => fn () => new class () extends LoginViewController {
					public function value(): array
					{
						return [
							'email'    => 'admin@getkirby.com',
							'password' => '12345678'
						];
					}
				}
			]
		]
	];
};
