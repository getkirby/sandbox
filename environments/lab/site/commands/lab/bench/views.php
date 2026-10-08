<?php

return [
	'description' => 'Benchmark views',
	'command' => function ($cli) {
		$iterations = 10;
		$progress   = $cli->lightBlue()->progress()->total($iterations);
		$start      = hrtime(true);

		foreach (range(0, $iterations) as $i) {
			$progress->current($i);

			foreach (page('fields')->children() as $fieldPage) {
				$fieldPage->panel()->view();
			}
		}

		$cli->out('Bench: ' . bench($start));
	}
];
