<?php

namespace Kirby\Sandbox;

use Kirby\Cms\Find;
use Kirby\Cms\User;
use Kirby\Panel\Controller\DialogController;
use Kirby\Panel\Ui\Dialog;
use Kirby\Panel\Ui\Dialog\FormDialog;

/**
 * Controls the dialog to log in as any other user without a password
 */
class AccountSwitchDialogController extends DialogController
{
	public function load(): Dialog
	{
		return new FormDialog(
			fields: [
				'account' => [
					'type'     => 'select',
					'label'    => 'Account',
					'options'  => $this->options(),
					'required' => true
				]
			],
			submitButton: [
				'icon' => 'refresh',
				'text' => 'Switch'
			],
			value: [
				'account' => $this->kirby->user()?->id()
			]
		);
	}

	public function options(): array
	{
		return $this->kirby->users()->sortBy('email')->values(
			fn (User $user) => [
				'text'  => $user->email() . ' - (' . $user->role() . ')',
				'value' => $user->id()
			]
		);
	}

	public function submit(): bool
	{
		Find::user($this->request->get('account'))->loginPasswordless();
		return true;
	}
}
