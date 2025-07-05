<?php

use Kirby\Cms\App;
use Kirby\Filesystem\Dir;
use Kirby\Filesystem\F;

class Environment
{
	/**
	 * Returns the name of the currently active environment
	 */
	public static function active(): string
	{
		return F::read(__DIR__ . '/public/.environment');
	}

	/**
	 * Authenticates as the given user without login
	 */
	public static function auth(string $username): bool
	{
		if ($user = App::instance()->user($username)) {
			$user->loginPasswordless();
			return true;
		}

		throw new Exception('The user could not be found');
	}

	/**
	 * Deletes an available environment from the `environments` folder
	 */
	public static function delete(string $environment): void
	{
		if (static::exists($environment) !== true) {
			throw new Exception('The environment could not be found');
		}

		Dir::remove(static::root($environment));
	}

	/**
	 * Returns a list of all available environments with an `active`
	 * marker for the current environment
	 */
	public static function envs(): array
	{
		$envs   = [];
		$active = static::active();

		foreach (Dir::read(__DIR__ . '/environments') as $env) {
			$envs[] = [
				'name'   => $env,
				'active' => $env === $active
			];
		}

		return $envs;
	}

	/**
	 * Returns whether an environment exists in the `environments` folder
	 */
	public static function exists(string $environment): bool
	{
		$root = static::root($environment);
		return is_dir($root) === true;
	}

	/**
	 * Copies an environment into the `public` dir
	 * and prepares it for use
	 */
	public static function install(string $environment): bool
	{
		if (static::exists($environment) !== true) {
			throw new Exception('The environment could not be found');
		}

		$root   = static::root($environment);
		$public = __DIR__ . '/public';

		// remove previous environment
		static::remove();

		$directories = [
			'assets',
			'content',
			'site'
		];

		foreach ($directories as $directory) {
			if (is_dir($root . '/' . $directory) === true) {
				static::copyDirectory(
					$root . '/' . $directory,
					$public . '/' . $directory
				);
			}
		}

		// copy global plugins
		foreach (Dir::read(__DIR__ . '/plugins') as $plugin) {
			static::copyDirectory(
				__DIR__ . '/plugins/' . $plugin,
				$public . '/site/plugins/' . $plugin
			);
		}

		// ensure installing the admin user
		static::installAdminUser();

		// link the submodules to the environment directory
		static::linkSubmodules($public, $root);

		// store the name of the environment for switching later
		F::write($public . '/.environment', $environment);

		return true;
	}

	/**
	 * Copies the admin user preset from `accounts` to the `public` folder
	 */
	public static function installAdminUser(): bool
	{
		$accounts = __DIR__ . '/accounts';
		$account  = $accounts . '/admin';
		$public   = __DIR__ . '/public';
		$dest     = $public . '/site/accounts/admin';

		if (is_dir($account) === false) {
			throw new Exception('The user does not exist');
		}

		// remove previous versions of the admin user
		Dir::remove($dest);

		// create the account folder if it does not exist
		Dir::make(dirname($dest));

		// copy the account
		static::copyDirectory($account, $dest);

		return true;
	}

	/**
	 * Clears the currently active installation in the `public` folder
	 */
	public static function remove()
	{
		// remove active user session
		if ($user = App::instance()->user()) {
			$user->logout();
		}

		$public = __DIR__ . '/public';

		Dir::remove($public . '/assets');
		Dir::remove($public . '/content');
		Dir::remove($public . '/media');
		Dir::remove($public . '/site');

		F::remove($public . '/.environment');
	}

	/**
	 * Returns the root to an environment in the `environments` folder
	 */
	public static function root(string $environment): string
	{
		return __DIR__ . '/environments/' . basename($environment);
	}

	/**
	 * Copies the current installation from the `public` folder to
	 * a new or existing environment in the `environments` folder
	 *
	 * @param string|null $environment Target environment (defaults to current one)
	 */
	public static function store(string|null $environment = null): bool
	{
		$public        = __DIR__ . '/public';
		$environment ??= F::read($public . '/.environment');

		if (!$environment) {
			return false;
		}

		$root = static::root($environment);

		// copy the submodule files to the public dir temporarily
		// so we can cleanly copy them back
		// (otherwise they would be deleted in the next step)
		static::unlinkSubmodules($public);

		// remove the previous state
		Dir::remove($root);
		Dir::make($root);

		$directories = [
			'assets',
			'content',
			'site'
		];

		foreach ($directories as $directory) {
			if (is_dir($public . '/' . $directory)) {
				static::copyDirectory(
					$public . '/' . $directory,
					$root . '/' . $directory
				);
			}
		}

		// link the submodules to the environment directory again
		static::linkSubmodules($public, $root);

		// remove directories that should not be stored
		Dir::remove($root . '/site/accounts/admin');
		Dir::remove($root . '/site/cache');
		Dir::remove($root . '/site/plugins/sandbox');
		Dir::remove($root . '/site/plugins/ray');
		Dir::remove($root . '/site/sessions');

		// store the name of the environment for switching later
		F::write($public . '/.environment', $environment);

		return true;
	}

	/**
	 * Copies a directory to a new destination including
	 * files ignored by Kirby like `.gitignore`
	 */
	protected static function copyDirectory(string $dir, string $target): void
	{
		// create a backup of the ignore list
		$ignore = Dir::$ignore;
		Dir::$ignore = [];

		try {
			Dir::copy($dir, $target);
		} finally {
			Dir::$ignore = $ignore;
		}
	}

	/**
	 * Returns an iterator that finds every submodule in the given directory
	 * unless it's a nested submodule (submodule within another submodule)
	 */
	protected static function findSubmodules($directory): Iterator
	{
		// iterate through all files and directories recursively
		$directory = new RecursiveDirectoryIterator(
			$directory,
			FilesystemIterator::KEY_AS_PATHNAME | FilesystemIterator::CURRENT_AS_FILEINFO | FilesystemIterator::SKIP_DOTS
		);
		$recursive = new RecursiveIteratorIterator(
			$directory,
			RecursiveIteratorIterator::SELF_FIRST
		);

		// only iterate through all directories that contain .git files
		return new CallbackFilterIterator($recursive, function ($fileinfo) {
			// only keep directories that have a .git file or folder themselves
			if (file_exists($fileinfo->getPathname() . '/.git') !== true) {
				return false;
			}

			// but skip every directory whose parent is already a submodule
			// (nested submodule which is already covered by the parent's link)
			$dir = dirname($fileinfo->getPathname());
			return file_exists($dir . '/.git') === false;
		});
	}

	/**
	 * Checks if the current environment is healthy
	 */
	public static function healthcheck(): void
	{
		$active      = static::active();
		$contentRoot = __DIR__ . '/public/content';
		$siteRoot    = __DIR__ . '/public/site';

		if ($active !== '' || is_dir($contentRoot) || is_dir($siteRoot)) {
			return;
		}

		static::install('lab');
	}

	/**
	 * Updates all `.git` files of submodules recursively to point to the new
	 * submodule path
	 *
	 * @param string $directory Directory to operate in
	 * @param string $previous Source directory to link the submodules to
	 */
	protected static function linkSubmodules(
		string $directory,
		string $previous
	): void {
		foreach (static::findSubmodules($directory) as $path => $fileinfo) {
			// find the matching submodule path in the original location
			$previousPath = str_replace($directory, $previous, $path);

			// replace the submodule with a symlink to the environment
			Dir::remove($path);
			symlink($previousPath, $path);
		}
	}

	/**
	 * Replaces all links to submodules with the actual submodule worktrees
	 */
	protected static function unlinkSubmodules(string $directory): void
	{
		foreach (static::findSubmodules($directory) as $path => $fileinfo) {
			if ($fileinfo->isLink() !== true) {
				continue;
			}

			$source = $fileinfo->getLinkTarget();
			if (is_string($source) !== true) {
				continue;
			}

			unlink($path);
			static::copyDirectory($source, $path);
		}
	}
}
