<?php

use Kirby\Content\MixedStorage;
use Kirby\Cms\Language;
use Kirby\Cms\Pages;
use Kirby\Content\Storage;
use Kirby\Content\VersionId;
use Kirby\Toolkit\A;
use Kirby\Uuid\Uuid;

class AnimalsMixedPage extends Page
{
	public function children(): Pages
	{
		if ($this->children instanceof Pages) {
			return $this->children;
		}

		$csv   = csv($this->root() . '/animals.csv', ';');
		$pages = new Pages();

		foreach ($csv as $animal) {
			$slug = Str::slug($animal['Scientific Name']);

			// No need to check for existing pages here. We can
			// simply assume that some of them might already be on disk
			// and some of them are not there yet.
			$page = Page::factory([
				'slug'     => $slug,
				'template' => 'animal-mixed',
				'model'    => 'animal-mixed',
				'parent'   => $this,
				'num'      => 0,
			]);

			// Switch to our new storage handler to keep all the default
			// features for pages on disk, but also add the virtual content layer
			$page->changeStorage(MixedStorage::class);

			// Write virtual content to our in-memory storage array
			$page->storage()->writeVirtual(
				versionId: VersionId::latest(),
				language: Language::ensure('default'),
				data: [
					'title'       => $animal['Scientific Name'],
					'commonName'  => $animal['Common Name'],
					'description' => $animal['Description'],
					'uuid'        => Uuid::generate(),
				]
			);

			$pages->add($page);
		}

		return $this->children = $pages;
	}
}
