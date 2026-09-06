<?php

use Kirby\Form\Form;

return [
	'description' => 'Benchmark fields',
	'command' => function ($cli) {
		$iterations = 5;
		$progress   = $cli->lightBlue()->progress()->total($iterations);
		$start      = hrtime(true);

		foreach (range(0, $iterations) as $i) {
			$progress->current($i);

			foreach (page('fields')->children() as $fieldPage) {
				Form::for($fieldPage)->reset();
			}
		}

		$cli->out('Bench: ' . bench($start));
	}
];
