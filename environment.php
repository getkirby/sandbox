<?php

class Environment
{

    public static function install($environment)
    {
        if (static::exists($environment) !== true) {
            die('The environment could not be found');
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

}
