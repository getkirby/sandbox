<?php

namespace Kirby\Sandbox;

use Kirby\Panel\Ui\Item;
use Kirby\Toolkit\Escape;
use Kirby\Toolkit\HtmlString;

/**
 * A single environment in the environments view
 */
class EnvironmentItem extends Item
{
	public function __construct(
		protected string $name,
		protected bool $active = false
	) {
		parent::__construct(
			info: $active === true ? 'active' : null,
			text: $active === true ? new HtmlString('<b>' . Escape::html($name) . '</b>') : $name
		);
	}

	/**
	 * Inline buttons in the item's footer to manage the environment
	 */
	public function buttons(): array
	{
		return [
			[
				'icon'    => 'import',
				'link'    => 'environments/' . $this->name . '/store',
				'text'    => 'Store',
				'variant' => 'filled'
			],
			[
				'icon'    => 'shuffle',
				'link'    => 'environments/' . $this->name . '/switch',
				'text'    => 'Switch',
				'variant' => 'filled'
			],
			[
				'dialog'  => 'environments/' . $this->name . '/delete',
				'icon'    => 'trash',
				'text'    => 'Delete',
				'variant' => 'filled'
			]
		];
	}

	public function props(): array
	{
		return [
			...parent::props(),
			'buttons' => $this->buttons()
		];
	}
}
