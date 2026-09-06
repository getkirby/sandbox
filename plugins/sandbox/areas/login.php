<?php

use Kirby\Sandbox\LoginViewController;

return function () {
	return [
		'views' => [
			'login.view' => [
				'action' => LoginViewController::class
			]
		]
	];
};
