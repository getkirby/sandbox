<!DOCTYPE html>
<html lang="<?= $kirby->language()->code() ?>">
<head>
	<meta charset="utf-8">
	<title><?= $page->title()->html() ?></title>
</head>
<body>
	<h1><?= $page->title()->html() ?></h1>
	<p data-field="text"><?= $page->text()->html() ?></p>
	<!-- makes the preview scrollable -->
	<div style="height: 300vh"></div>
</body>
</html>
