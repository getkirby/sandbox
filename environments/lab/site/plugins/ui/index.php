<?php

use Kirby\Cms\App;
use Kirby\Lab\Example;

load([
	'kirby\lab\example' => __DIR__ . '/src/Lab/Example.php'
]);

require_once __DIR__ . '/helpers.php';

App::plugin('getkirby/ui', [
	'areas' => [
		'ui' => function () {
			return [
				'label' => 'UI',
				'icon'  => 'palette',
				'menu'  => true,
				'link'  => 'ui',
				'views' => [
					[
						'pattern' => 'ui',
						'action'  => function () {
							$examples = Example::all();

							return [
								'component' => 'k-ui-index-view',
								'props' => [
									'examples' => $examples
								],
							];
						}
					],
					[
						'pattern' => [
							'ui/(:any)/index.vue',
							'ui/(:any)/(:any)/index.vue'
						],
						'action'  => function (string $id, string|null $tab = null) {
							$example = new Example(
								id: $id,
								tab: $tab
							);

							return $example->serve();
						}
					],
					[
						'pattern' => 'ui/(:any)/(:any?)',
						'action'  => function (string $id, string|null $tab = null) {
							$example = new Example(
								id: $id,
								tab: $tab
							);

							$vue = $example->vue();

							return [
								'component' => 'k-ui-playground-view',
								'breadcrumb' => [
									[
										'label' => $example->title(),
										'link'  => $example->url()
									]
								],
								'props' => [
									'title'    => $example->title(),
									'template' => $vue['template'],
									'styles'   => $vue['style'],
									'file'     => $example->module(),
									'props'    => $example->props(),
									'tab'      => $example->tab(),
									'tabs'     => array_values($example->tabs()),
								],
							];
						}
					],
				],
			];
		}
	]
]);
