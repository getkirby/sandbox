<?php

namespace Kirby\Lab;

use Kirby\Cms\App;
use Kirby\Template\Snippet as BaseSnippet;

class Snippet extends BaseSnippet
{

	public static function root(): string
	{
		return dirname(__DIR__, 2) . '/snippets';
	}
}
