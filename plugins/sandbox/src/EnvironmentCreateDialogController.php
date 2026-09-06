<?php

namespace Kirby\Sandbox;

use Environment;
use Kirby\Panel\Controller\DialogController;
use Kirby\Panel\Ui\Dialog;
use Kirby\Panel\Ui\Dialog\FormDialog;

/**
 * Controls the dialog to store the current public folder
 * as a new environment
 */
class EnvironmentCreateDialogController extends DialogController
{
	public function load(): Dialog
	{
		return new FormDialog(
			fields: [
				'name' => [
					'type'     => 'text',
					'label'    => 'Environment name',
					'help'     => 'New environment will be based on the current public folder',
					'required' => true
				]
			],
			submitButton: [
				'icon' => 'add',
				'text' => 'Create'
			]
		);
	}

	public function submit(): bool
	{
		Environment::store($this->request->get('name'));
		return true;
	}
}
