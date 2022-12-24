<?php $kirby->response()->header('X-Staticache', 'json') ?>
<?= json_encode([
	'title' => $page->title()->value()
], JSON_PRETTY_PRINT);
