<?php

namespace Kirby\Sandbox;

use Environment;
use Kirby\Panel\Controller\ViewController;
use Kirby\Panel\Ui\Button\ViewButtons;
use Kirby\Panel\Ui\View;
use Kirby\Toolkit\A;

/**
 * Controls the view that lists all sandbox environments
 */
class EnvironmentsViewController extends ViewController
{
	public function buttons(): ViewButtons
	{
		return ViewButtons::view('environments')->defaults('site.open', 'create');
	}

	public function environments(): array
	{
		return A::map(
			Environment::envs(),
			fn (array $env) => (new EnvironmentItem(...$env))->props()
		);
	}

	public function load(): View
	{
		return new View(
			component:    'k-environments-view',
			buttons:      $this->buttons(),
			environments: $this->environments(),
			title:        'Sandbox'
		);
	}
}
