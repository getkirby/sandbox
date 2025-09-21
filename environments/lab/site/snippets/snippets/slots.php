<p>d. Content from a snippet that also provides slots</p>

<?= $slot ?>

<?= $slots->second() ?>

<?php if ($foo = $slots->foo()): ?>
	<?= $foo ?>
<?php else: ?>
	<p>g. Fallback content for a non-existent/unfilled slot in the snippet.</p>
<?php endif ?>
