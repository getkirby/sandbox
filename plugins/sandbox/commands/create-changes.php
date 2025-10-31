<?php

use Kirby\Api\Controller\Changes as ChangesController;
use Kirby\Content\Changes;

return [
	'description' => 'Create random changes',
	'command' => function ($cli) {

		$kirby = $cli->kirby();
		$kirby->impersonate('admin');
		$site   = $kirby->site();
		$index  = $site->index();
		$change = function ($model) {
			try {
				ChangesController::save($model, [
					'updated' => date('Y-m-d H:i:s')
				]);
			} catch (Throwable) {
			}
		};

		$changes = new Changes();

		// reset all recent changes
		$site->version('changes')->delete();

		foreach ($changes->files() as $file) {
			$file->version('changes')->delete();
		}

		foreach ($changes->pages() as $page) {
			$page->version('changes')->delete();
		}

		foreach ($changes->users() as $user) {
			$user->version('changes')->delete();
		}

		// create a change for the site
		$change($site);

		foreach ($site->files()->shuffle()->limit(100) as $file) {
			$change($file);
		}

		// create random changes for pages
		foreach ($index->shuffle()->limit(100) as $page) {
			$change($page);

			foreach ($page->files()->shuffle()->limit(100) as $file) {
				$change($file);
			}
		}

		// create random changes for users
		foreach ($kirby->users()->shuffle()->limit(100) as $user) {
			$change($user);

			foreach ($user->files()->shuffle()->limit(100) as $file) {
				$change($file);
			}
		}

		// this should not be needed, but unfortunately is
		$changes->generateCache();

		$cli->success('Changes created');
	}
];
