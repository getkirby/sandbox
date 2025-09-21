<?php snippet('snippets/layout', slots: true) ?>

<p>a. Some content from the template.</p>

<?php snippet('snippets/simple') ?>

<?php snippet('snippets/slots', slots: true) ?>
	<?php slot() ?>
	<p>e. Content from the tempalte in the default slot of the snippet.</p>
	<?php endslot() ?>
	<?php slot('second') ?>
	<p>f. Content from the tempalte in the second slot of the snippet.</p>
	<?php endslot() ?>
<?php endsnippet() ?>

<?php snippet('snippets/unclosed') ?>

<strong>Should show headline as well as paragraphs a-j from different snippets.</strong>
