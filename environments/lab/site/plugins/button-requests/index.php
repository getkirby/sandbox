<?php

/**
 * Request routes for the button examples,
 * slowed down to show the loading state
 */
Kirby::plugin('plugins/button-requests', [
	'areas' => [
		'button-requests' => [
			'requests' => [
				'button-requests.delete' => [
					'pattern' => 'button-requests/delete',
					'method'  => 'DELETE',
					'action'  => function () {
						usleep(750000);
						return ['message' => 'Deleted via DELETE'];
					}
				],
				'button-requests.error' => [
					'pattern' => 'button-requests/error',
					'method'  => 'POST',
					'action'  => function () {
						usleep(750000);
						throw new Exception('This request failed on purpose');
					}
				],
				'button-requests.message' => [
					'pattern' => 'button-requests/message/(:all)',
					'method'  => 'POST',
					'action'  => function (string $id) {
						usleep(750000);
						return ['message' => 'Synced ' . $id];
					}
				],
				'button-requests.reload' => [
					'pattern' => 'button-requests/reload',
					'method'  => 'POST',
					'action'  => function () {
						usleep(750000);
						return [
							'message' => 'The view has been reloaded',
							'reload'  => true
						];
					}
				],
			]
		]
	]
]);
