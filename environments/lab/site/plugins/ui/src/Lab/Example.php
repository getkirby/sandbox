<?php

namespace Kirby\Lab;

use Kirby\Cms\App;
use Kirby\Exception\NotFoundException;
use Kirby\Filesystem\F;
use Kirby\Filesystem\Dir;
use Kirby\Http\Response;

class Example
{
	protected string $base;
	protected string $root;
	protected string|null $tab = null;
	protected array $tabs;

	public function __construct(
		protected string $id,
		string|null $tab = null,
	) {
		$this->base = static::base();
		$this->root = $this->base . '/' . $this->id;

		if ($this->exists() === false) {
			throw new NotFoundException('The example could not be found');
		}

		$this->tabs = $this->collectTabs();
		$this->tab  = $this->collectTab($tab);
	}

	public static function all(): array
	{
		$examples = Dir::inventory(static::base())['children'];

		return array_map(function($props) {
			$example = new static(
				id: $props['dirname']
			);

			return [
				'image' => [
					'icon' => 'palette',
					'back' => 'white',
				],
				'text' => $example->title(),
				'link' => $example->url()
			];
		}, $examples);
	}

	public static function base(): string
	{
		return App::instance()->root('site') . '/ui';
	}

	public function collectTab(string|null $tab): string|null
	{
		if (empty($this->tabs) === true) {
			return null;
		}

		if (array_key_exists($tab, $this->tabs) === true) {
			return $tab;
		}

		return array_key_first($this->tabs);
	}

	public function collectTabs(): array
	{
		$tabs = [];

		foreach(Dir::inventory($this->root)['children'] as $child) {
			$tabs[$child['dirname']] = [
				'name'  => $child['dirname'],
				'label' => $child['slug'],
				'link'  => '/ui/' . $this->id . '/' . $child['dirname']
			];
		}

		return $tabs;
	}

	public function exists(): bool
	{
		return is_dir($this->root) === true;
	}

	public function file(string $filename): string
	{
		return $this->base . '/' . $this->path() . '/' . $filename;
	}

	public function id(): string
	{
		return $this->id;
	}

	public function load(string $filename): array|null
	{
		$file = $this->file($filename);

		if (is_file($file) === false) {
			return null;
		}

		return F::load($file);
	}

	public function module(): string
	{
		return $this->url() . '/index.vue';
	}

	public function path(): string
	{
		if ($this->tab === null) {
			return $this->id;
		}

		return $this->id . '/' . $this->tab;
	}

	public function props(): array|null
	{
		return $this->load('index.php');
	}

	public function read(string $filename): string|null
	{
		$file = $this->file($filename);

		if (is_file($file) === false) {
			return null;
		}

		return F::read($file);
	}

	public function root(): string
	{
		return $this->root;
	}

	public function serve(): Response
	{
		return new Response($this->vue()['script'], 'application/javascript');
	}

	public function tab(): string|null
	{
		return $this->tab;
	}

	public function tabs(): array
	{
		return $this->tabs;
	}

	public function title(): string
	{
		return basename($this->id);
	}

	public function url(): string
	{
		return '/ui/' . $this->path();
	}

	public function vue(): array
	{
		$file = $this->read('index.vue') ?? '';

		if (preg_match('!<template>(.*?)</template>!s', $file, $match)) {
			$parts['template'] = preg_replace('!^\n!', '', $match[1]);
		} else {
			$parts['template'] = null;
		}

		if (preg_match('!<script>(.*?)</script>!s', $file, $match)) {
			$parts['script'] = trim($match[1]);
		} else {
			$parts['script'] = 'export default {}';
		}

		if (preg_match('!<style>(.*?)</style>!s', $file, $match)) {
			$parts['style'] = trim($match[1]);
		} else {
			$parts['style'] = null;
		}

		return $parts;
	}

}

