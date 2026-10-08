<?php

use SebastianBergmann\Timer\ResourceUsageFormatter;
use SebastianBergmann\Timer\Timer;

return [
	'description' => 'Benchmark fields',
	'command' => function ($cli) {
		$iterations = 10;
		$progress   = $cli->lightBlue()->progress()->total($iterations);

		$timer = new Timer;
		$timer->start();

		foreach (range(0, $iterations) as $i) {
			$progress->current($i);

			foreach (page('fields')->children() as $fieldPage) {
				$fieldPage->panel()->view();
			}
		}

		$result =  (new ResourceUsageFormatter)->resourceUsage($timer->stop());

		$cli->out('Bench: ' . $result);
	}
];
