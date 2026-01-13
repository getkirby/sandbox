<header>

    This is the header. It's also pushing something to the style stack. If this works. The background should be purple.

    <?php push('style') ?>
    body {
        background: purple;
    }
    <?php endpush() ?>

</header>
