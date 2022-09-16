<?php

use Kirby\Filesystem\Dir;
use Kirby\Filesystem\F;

class Environment
{

    public static function active(): string
    {
        return F::read(__DIR__ . '/public/.environment');
    }

    public static function auth(string $username): bool
    {
        if ($user = kirby()->user($username)) {
            $user->loginPasswordless();
            return true;
        }

        throw new Exception('The user could not be found');
    }

    public static function delete(string $environment): void
    {
        if (static::exists($environment) !== true) {
            throw new Exception('The environment could not be found');
        }

        Dir::remove(static::root($environment));
    }

    public static function envs(): array
    {
        $envs = [];

        $activeEnv = static::active();

        foreach (Dir::read(__DIR__ . '/environments') as $env) {
            $root = static::root($env);

            $envs[] = [
                'name'   => $env,
                'active' => $env === $activeEnv
            ];
        }

        return $envs;
    }

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
            if (is_dir($root . '/' . $directory)) {
                Dir::copy($root . '/' . $directory, $public . '/' . $directory);
            }
        }

        // copy the global ray plugin
        Dir::copy(__DIR__ . '/plugins/ray', $public . '/site/plugins/ray');

        // remove pre-installed users
        if (is_dir($public . '/site/accounts') === true) {
            Dir::remove($public . '/site/accounts');
        }

        // store the name of the environment for switching later
        F::write($public . '/.environment', $environment);

        return true;
    }

    public static function exists(string $environment): bool
    {
        return is_dir(static::root($environment));
    }

    public static function remove()
    {
        $public = __DIR__ . '/public';

        Dir::remove($public . '/assets');
        Dir::remove($public . '/content');
        Dir::remove($public . '/media');
        Dir::remove($public . '/site');
    }

    public static function root(string $environment): string
    {
        return __DIR__ . '/environments/' . basename($environment);
    }

    public static function store(?string $environment = null): bool
    {
        $public      = __DIR__ . '/public';
        $environment = $environment ?? F::read($public . '/.environment');
        if (!$environment) {
            return false;
        }

        $root = static::root($environment);

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
                Dir::copy($public . '/' . $directory, $root . '/' . $directory);
            }
        }

        // remove directories that should not be stored
        Dir::remove($root . '/site/accounts');
        Dir::remove($root . '/site/cache');
        Dir::remove($root . '/site/plugins/ray');
        Dir::remove($root . '/site/sessions');

        // store the name of the environment for switching later
        F::write($public . '/.environment', $environment);

        return true;
    }

    public static function user(string $username): bool
    {
        $accounts = __DIR__ . '/accounts';
        $account  = $accounts . '/' . basename($username);
        $public   = __DIR__ . '/public';
        $dest     = $public . '/site/accounts/' . basename($username);

        if (is_dir($account) === false) {
            throw new Exception('The user does not exist');
        }

        // remove previous versions of the user
        Dir::remove($dest);

        // create the account folder if it does not exist
        Dir::make(dirname($dest));

        // copy the account
        Dir::copy($account, $dest);

        return true;
    }

}
