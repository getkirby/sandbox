<?php

use Kirby\Cms\App;
use Kirby\Panel\Panel;
use Kirby\Toolkit\A;

App::plugin('getkirby/environemnts', [
	'areas' => [
		'environments' => function ($kirby) {
			return [
				'label' => 'Environments',
				'icon'  => 'box',
				'menu'  => true,
				'link'  => 'environments',
				'views' => [
					[
						'pattern' => 'environments',
						'action'  => function () {
							return [
								'component' => 'k-environments-view',
								'props' => [
									'environments' => A::map(
										Environment::envs(),
										fn ($env) => [
											'text' => $env['active'] ? '<b>' . $env['name'] . '</b>' : $env['name'],
											'info' => $env['active'] ? 'active' : null,
											'buttons' => [
												[
													'icon'    => 'import',
													'text'    => 'Store',
													'variant' => 'filled',
													'link'    => 'environments/' . $env['name'] . '/store'
												],
												[
													'icon'    => 'shuffle',
													'text'    => 'Switch',
													'variant' => 'filled',
													'link'    => 'environments/' . $env['name'] . '/switch'
												],
												[
													'icon'    => 'trash',
													'text'    => 'Delete',
													'variant' => 'filled',
													'link'    => 'environments/' . $env['name'] . '/delete'
												]
											]
										]
									)
								],
							];
						}
					],
					[
						'pattern' => 'environments/(:any)/store',
						'action'  => function (string $env) {
							Environment::store($env);
							Panel::go('environments');
						}
					],
					[
						'pattern' => 'environments/(:any)/switch',
						'action'  => function (string $env) {
							Environment::install($env);
							Environment::user('test');
							go(url('env/auth/test@getkirby.com?panel'));
						}
					],
					[
						'pattern' => 'environments/(:any)/switch',
						'action'  => function (string $env) {
							Environment::delete($env);
							Panel::go('environments');
						}
					]
				],
				'dialogs' => [
					'environments/create' => [
						'load'   => function () {
							return [
								'component' => 'k-form-dialog',
								'props' => [
									'fields' => [
										'env' => [
											'type'  => 'text',
											'label' => 'Environment name',
										]
									],
									'submitButton' => [
										'icon' => 'add',
										'text' => 'Create'
									]
								]
							];
						},
						'submit' => function () {
							$env = get('env');
							Environment::store($env);

							return true;
						}
					]
				]
			];
		}
	]
]);