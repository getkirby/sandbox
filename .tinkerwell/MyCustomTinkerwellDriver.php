<?php

use Tinkerwell\ContextMenu\Label;
use Tinkerwell\ContextMenu\OpenURL;

class MyCustomTinkerwellDriver extends TinkerwellDriver
{
	protected $kirby;

    public function canBootstrap($projectPath)
    {
        return file_exists($projectPath . '/kirby/bootstrap.php');
    }

    public function bootstrap($projectPath)
    {
		define('KIRBY_HELPER_DUMP', false);

		require $projectPath . '/kirby/bootstrap.php';

		$this->kirby = new Kirby([
			'options' => [
				'api' => [
					'csrf' => 'dev'
				],
				'cache' => [
					'changes' => [
						'prefix' => 'changes'
					],
					'pages' => [
						'prefix' => 'pages'
					],
					'updates' => [
						'prefix' => 'updates'
					],
					'uuid' => [
						'prefix' => 'uuid'
					]
				],
				'debug' => true,
				'email' => [
					'transport' => [
						'type' => 'smtp',
						'host' => 'localhost',
						'port' => 1025,
						'security' => false
					]
				],
				'panel' => [
					'dev' => true
				]
			],
			'roots' => [
				'index' => $projectPath . '/public'
			],
		]);
    }

    public function getAvailableVariables()
    {
        return [
            'site'  => $this->kirby->site(),
            'kirby' => $this->kirby,
        ];
    }

    public function contextMenu()
    {
        return [
            Label::create('Detected Kirby v.' . $this->kirby->version()),

            OpenURL::create('Kirby Guide', 'https://getkirby.com/docs/guide'),
            OpenURL::create('Kirby Reference', 'https://getkirby.com/docs/reference'),
        ];
    }
}
