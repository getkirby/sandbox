<?php

use Kirby\CLI\CLI;
use SebastianBergmann\Timer\ResourceUsageFormatter;
use SebastianBergmann\Timer\Timer;

return [
	'command' => function (CLI $cli) {
		$iterations = 1000;
		$progress   = $cli->lightBlue()->progress()->total($iterations);

		$timer = new Timer;
		$timer->start();

		$page = page('benchmarks/snippets');

		foreach (range(0, $iterations) as $i) {
			$progress->current($i);

			$page->render();
		}

		$result = (new ResourceUsageFormatter)->resourceUsage($timer->stop());

		$cli->out('Bench: ' . $result);
	}
];
