<?php

use Kirby\CLI\CLI;

return [
	'description' => 'Benchmark snippets',
	'command' => function (CLI $cli) {
		$iterations = 1000;
		$progress   = $cli->lightBlue()->progress()->total($iterations);
		$start      = hrtime(true);

		$page = page('benchmarks/snippets');

		foreach (range(0, $iterations) as $i) {
			$progress->current($i);

			$page->render();
		}

		$cli->out('Bench: ' . bench($start));
	}
];
