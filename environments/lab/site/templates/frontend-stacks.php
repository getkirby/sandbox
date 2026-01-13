<?php snippet('stacks/layout', slots: true) ?>

<?php push('style') ?>
body {
background-color: red;
}
<?php endpush() ?>

<?php push('script') ?>
alert('Stacks are working');
<?php endpush() ?>

<?php snippet('stacks/header') ?>

<h1>Stacks</h1>

<?php push('header', 'Hello') ?>
<?php push('header', 'World') ?>
