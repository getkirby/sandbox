<?php

class Environment
{

    public static function auth(string $username): bool
    {
        if ($user = kirby()->user($username)) {
            $user->loginPasswordless();
            return true;
        }

        throw new Exception('The user could not be found');
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
        return __DIR__ . '/environments/' . $environment;
    }

    public static function store(?string $environment): bool
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
        touch($root . '/.gitkeep');

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

        // remove current users
        if (is_dir($root . '/site/accounts') === true) {
            Dir::remove($root . '/site/accounts');
        }

        // store the name of the environment for switching later
        F::write($public . '/.environment', $environment);

        return true;
    }

    public static function user(string $username): bool
    {
        $accounts = __DIR__ . '/accounts';
        $account  = $accounts . '/' . $username;
        $public   = __DIR__ . '/public';
        $dest     = $public . '/site/accounts/' . $username;

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
