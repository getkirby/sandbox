<?php

use Kirby\Cms\Pages;
use Kirby\Toolkit\A;
use Kirby\Uuid\Uuid;

class AnimalsPage extends Page
{
    public function children(): Pages
    {
        if ($this->children instanceof Pages) {
            return $this->children;
        }

        $csv      = csv($this->root() . '/animals.csv', ';');
        $children = A::map($csv, fn ($animal) => [
			'slug'     => Str::slug($animal['Scientific Name']),
			'template' => 'animal',
			'model'    => 'animal',
			'num'      => 0,
			'content'  => [
				'title'       => $animal['Scientific Name'],
				'commonName'  => $animal['Common Name'],
				'description' => $animal['Description'],
				'uuid'        => Uuid::generate(),
			]
		]);

        return $this->children = Pages::factory($children, $this);
    }
}
