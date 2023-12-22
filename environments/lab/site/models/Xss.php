<?php

class XssPage extends Page
{
	public function colorOptions(): array
	{
		$xss = '"><strong style="color: var(--color-red-700)">Malicious string</strong><img onerror="alert(\'XSS: Page title\')" src="x">';

		return [
			$xss => '#aaa'
		];
	}
}
