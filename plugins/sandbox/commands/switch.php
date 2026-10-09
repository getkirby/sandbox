<?php

use Kirby\Filesystem\Dir;
use Kirby\Filesystem\F;

return [
	'description' => 'Switch the sandbox, Kirby and demokit between Kirby 5 and 6',
	'args' => [
		'version' => [
			'description' => 'The major version to switch to (v5 or v6)'
		]
	],
	'command' => function ($cli) {
		$branches = [
			'v5' => [
				'.'                       => 'main',
				'kirby'                   => 'develop-minor',
				'environments/demokit'    => 'main',
				'environments/starterkit' => 'main'
			],
			'v6' => [
				'.'                       => 'feat/v6',
				'kirby'                   => 'v6/develop',
				'environments/demokit'    => 'v6',
				'environments/starterkit' => 'v6'
			]
		];

		$version = $cli->argOrPrompt('version', 'Which version? (v5 or v6)');
		$version = 'v' . ltrim(strtolower($version), 'v');

		if (isset($branches[$version]) === false) {
			throw new Exception('Unknown version "' . $version . '". Use v5 or v6');
		}

		$public = $cli->kirby()->root('index');
		$root   = dirname($public);

		// runs a shell command in the given directory and
		// returns its output (throws on failure unless $check is false)
		$run = function (
			string $dir,
			string $command,
			bool $check = true
		) use ($root): array {
			$output = [];
			$code   = 0;

			exec('cd ' . escapeshellarg($root . '/' . $dir) . ' && ' . $command . ' 2>&1', $output, $code);

			if ($check === true && $code !== 0) {
				throw new Exception('Command failed in ' . $dir . ': ' . $command . "\n" . implode("\n", $output));
			}

			return ['code' => $code, 'output' => $output];
		};

		$git = fn (string $repo, string $args, bool $check = true) => $run(
			dir: $repo,
			command: 'git ' . $args,
			check: $check
		);

		// preflight: make sure every repo can be switched
		// before touching anything
		$errors = [];
		$todo   = [];

		foreach ($branches[$version] as $repo => $branch) {
			$name    = $repo === '.' ? 'sandbox' : $repo;
			$current = $git($repo, 'branch --show-current')['output'][0] ?? '';

			if ($current === $branch) {
				$cli->out($name . ' is already on ' . $branch);
				continue;
			}

			$status = $git($repo, 'status --porcelain --untracked-files=no --ignore-submodules=all')['output'];

			if ($status !== []) {
				$errors[] = $name . ' has uncommitted changes';
				continue;
			}

			$local  = $git($repo, 'rev-parse --verify --quiet ' . escapeshellarg('refs/heads/' . $branch), check: false)['code'] === 0;
			$remote = $git($repo, 'rev-parse --verify --quiet ' . escapeshellarg('refs/remotes/origin/' . $branch), check: false)['code'] === 0;

			if ($local === false && $remote === false) {
				$errors[] = $name . ' has no branch ' . $branch;
				continue;
			}

			$todo[$repo] = $branch;
		}

		if ($errors !== []) {
			foreach ($errors as $error) {
				$cli->error($error);
			}

			throw new Exception('Nothing has been switched');
		}

		$kirbyHead = $git('kirby', 'rev-parse HEAD')['output'][0];

		// switch all repos
		foreach ($todo as $repo => $branch) {
			$git($repo, 'checkout ' . escapeshellarg($branch));
			$cli->out(($repo === '.' ? 'sandbox' : $repo) . ' → ' . $branch);
		}

		// the running dev server belongs to the previous version,
		// so the panel must not try to load assets from it anymore
		F::remove($root . '/kirby/panel/.vite-running');

		// reset the public folder and mark the lab
		// as the environment to install
		foreach (['assets', 'content', 'media', 'site'] as $dir) {
			Dir::remove($public . '/' . $dir);
		}

		F::write($public . '/.environment', 'lab');

		// install the lab in a fresh process with the
		// new Kirby version (the health check takes care of it)
		$bin    = realpath($_SERVER['argv'][0]);
		$result = $run(
			dir: '.',
			command: escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($bin) . ' version'
		);

		$cli->out('Installed the lab environment');
		$cli->out('Kirby ' . trim(implode(' ', $result['output'])));

		// install panel dependencies if they changed
		$lock = $git('kirby', 'diff --quiet ' . escapeshellarg($kirbyHead) . ' HEAD -- panel/package-lock.json', check: false);

		if ($lock['code'] !== 0) {
			$cli->out('Installing panel dependencies …');
			passthru('cd ' . escapeshellarg($root . '/kirby/panel') . ' && npm i', $code);

			if ($code !== 0) {
				throw new Exception('npm i failed in kirby/panel');
			}
		}

		$cli->success('Switched to Kirby ' . substr($version, 1));
		$cli->info('Please restart `npm run dev` in kirby/panel');
	}
];
