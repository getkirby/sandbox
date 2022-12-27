<?php

if (kirby()->request()->method() === 'POST') {
	switch (get('action')) {
		case 'store':
			Environment::store(get('environment'));
			break;
		case 'switch':
			Environment::install(get('environment'));
			Environment::user('test');
			break;
		case 'store-switch':
			Environment::store();
			Environment::install(get('environment'));
			Environment::user('test');
			break;
		case 'delete':
			Environment::delete(get('environment'));
			break;
	}
}

$active = Environment::active();

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Kirby Sandbox</title>

	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
			padding: 4% 8%;
			line-height: 1.5em;
		}
		table {
			margin-top: 2rem;
		}
	</style>
</head>
<body>
	<h1>Kirby Sandbox</h1>
	<a href="<?= url('/') ?>">Home</a> |
	<a href="<?= url('panel') ?>">Panel</a> |
	<a href="<?= url('env/auth/test@getkirby.com') ?>">Auth test@getkirby.com</a>

	<table>
		<?php foreach (Environment::envs() as $env): ?>
		<tr>
			<td>
				<?php if ($env['active']): ?><strong><?php endif ?>
				<?= $env['name'] ?>
				<?php if ($env['active']): ?></strong><?php endif ?>
			</td>
			<td>
				<form method="POST" action="<?= url('?env') ?>">
					<input type="hidden" name="environment" value="<?= html($env['name']) ?>">
					<button type="submit" name="action" value="store">Store</button>
					<button type="submit" name="action" value="switch">Switch</button>
					<button type="submit" name="action" value="store-switch"<?php if ($env['active']): ?> disabled<?php endif ?>>
						Store to "<?= html($active) ?>" &amp; Switch
					</button>
					<button type="submit" name="action" value="delete">Delete</button>
				</form>
			</td>
		</tr>
		<?php endforeach ?>

		<form method="POST" action="<?= url('?env') ?>">
		<tr>
			<td>
				<input type="text" name="environment" placeholder="Custom...">
			</td>
			<td>
				<button type="submit" name="action" value="store">Store</button>
			</td>
		</tr>
		</form>
	</table>
</body>
</html>
