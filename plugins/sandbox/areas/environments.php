<?php

use Kirby\Panel\Panel;
use Kirby\Panel\Ui\Button\ViewButton;
use Kirby\Sandbox\AccountSwitchDialogController;
use Kirby\Sandbox\EnvironmentCreateDialogController;
use Kirby\Sandbox\EnvironmentDeleteDialogController;
use Kirby\Sandbox\EnvironmentsViewController;

return function () {
	return [
		'icon'    => 'box',
		'label'   => 'Environments',
		'link'    => 'environments',
		'menu'    => true,
		'buttons' => [
			'environments.create' => fn () => new ViewButton(
				dialog: 'environments/create',
				icon: 'add',
				text: 'New environment'
			)
		],
		'dialogs' => [
			'account.switch' => [
				'pattern' => 'accounts/switch',
				'action'  => AccountSwitchDialogController::class
			],
			'environment.create' => [
				'pattern' => 'environments/create',
				'action'  => EnvironmentCreateDialogController::class
			],
			'environment.delete' => [
				'pattern' => 'environments/(:any)/delete',
				'action'  => EnvironmentDeleteDialogController::class
			]
		],
		'views' => [
			'environments' => [
				'pattern' => 'environments',
				'action'  => EnvironmentsViewController::class
			],
			'environment.store' => [
				'pattern' => 'environments/(:any)/store',
				'action'  => function (string $environment) {
					Environment::store($environment);
					Panel::go('environments');
				}
			],
			'environment.switch' => [
				'pattern' => 'environments/(:any)/switch',
				'action'  => function (string $environment) {
					Environment::install($environment);
					go(url('env/auth/admin@getkirby.com?panel'));
				}
			]
		]
	];
};
