<?php

use Kirby\Form\Form;
use SebastianBergmann\Timer\ResourceUsageFormatter;
use SebastianBergmann\Timer\Timer;

return [
	'description' => 'Benchmark fields',
	'command' => function ($cli) {
		$kirby = $cli->kirby();

		$timer = new Timer;
		$timer->start();

		foreach (range(0,10) as $i) {
			foreach (page('fields')->children() as $fieldPage) {
				$fieldPage->panel()->view();
			}
		}

		$result =  (new ResourceUsageFormatter)->resourceUsage($timer->stop());

		$cli->out('Bench: ' . $result);
	}
];
