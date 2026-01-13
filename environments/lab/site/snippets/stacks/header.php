<header>

	<p>This is the header. It's also pushing something to the style stack. If this works. The background should be purple.</p>

	<?php push('style') ?>
	body {
	background: purple;
	}
	<?php endpush() ?>

	<p>We are pushing content to a stack inside this header snippet. The following should read "Hello World": <?php stack('header', glue: ' ') ?></p>

</header>
