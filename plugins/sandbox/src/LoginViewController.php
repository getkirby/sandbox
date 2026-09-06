<?php

namespace Kirby\Sandbox;

use Kirby\Auth\Method\PasswordMethod;
use Kirby\Panel\Controller\View\LoginViewController as BaseLoginViewController;

/**
 * Prefills the login form with the sandbox admin credentials
 */
class LoginViewController extends BaseLoginViewController
{
	protected function value(): array
	{
		if ($this->current instanceof PasswordMethod === false) {
			return [];
		}

		return [
			'email'    => 'admin@getkirby.com',
			'password' => '12345678'
		];
	}
}
