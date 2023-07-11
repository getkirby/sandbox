<?php

use Kirby\Cms\App;
use Kirby\Panel\Panel;
use Kirby\Toolkit\A;

App::plugin('getkirby/environments', [
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
													'dialog'    => 'environments/' . $env['name'] . '/delete'
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
											'type'     => 'text',
											'label'    => 'Environment name',
											'required' => true,
											'help'     => 'New environment will be based on the current public folder'
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
							Environment::store(get('env'));
							return true;
						}
					],
					'environments/delete' => [
						'pattern' => 'environments/(:any)/delete',
						'load'   => function (string $env) {
							return [
								'component' => 'k-remove-dialog',
								'props' => [
									'text' => 'Are you sure you want to delete the <b>' . $env . '</b> environment?'
								]
							];
						},
						'submit' => function (string $env) {
							Environment::delete($env);
							return true;
						}
					]
				]
			];
		}
	]
]);