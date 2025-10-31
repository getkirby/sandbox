<?php

use Kirby\Cms\User;
use Kirby\Data\Data;

return [
	'description' => 'Create random users',
	'command' => function ($cli) {

		$kirby = $cli->kirby();
		$kirby->impersonate('admin');

		$users = Data::read(__DIR__ . '/_placeholders/users.json');

		foreach ($users as $user) {
			User::create([
				'email' => $user['email'],
				'name'  => $user['name'],
				'role'  => $user['role']
			]);
		}

		$cli->success(count($users) . ' users created');
	}
];
