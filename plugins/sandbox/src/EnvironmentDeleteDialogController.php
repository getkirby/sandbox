<?php

namespace Kirby\Sandbox;

use Environment;
use Kirby\Panel\Controller\DialogController;
use Kirby\Panel\Ui\Dialog;
use Kirby\Panel\Ui\Dialog\RemoveDialog;

/**
 * Controls the dialog to delete a stored environment
 */
class EnvironmentDeleteDialogController extends DialogController
{
	public function __construct(
		public string $environment
	) {
		parent::__construct();
	}

	public function load(): Dialog
	{
		return new RemoveDialog(
			text: $this->i18nHtml(
				'Are you sure you want to delete the <b>{{ name }}</b> environment?',
				['name' => $this->environment]
			)
		);
	}

	public function submit(): bool
	{
		Environment::delete($this->environment);
		return true;
	}
}
