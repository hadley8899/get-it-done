<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use RuntimeException;

trait CreatesApplication
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        // Ensure test process env is deterministic even if container env vars are present.
        putenv('APP_ENV=testing');
        putenv('DB_CONNECTION=mysql');
        putenv('DB_DATABASE=backend_test');

        $_ENV['APP_ENV'] = 'testing';
        $_ENV['DB_CONNECTION'] = 'mysql';
        $_ENV['DB_DATABASE'] = 'backend_test';
        $_SERVER['APP_ENV'] = 'testing';
        $_SERVER['DB_CONNECTION'] = 'mysql';
        $_SERVER['DB_DATABASE'] = 'backend_test';

        $privateKey = __DIR__.'/../storage/oauth-private.key';
        $publicKey = __DIR__.'/../storage/oauth-public.key';

        if (is_file($privateKey)) {
            @chmod($privateKey, 0600);
        }

        if (is_file($publicKey)) {
            @chmod($publicKey, 0600);
        }

        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        if ($app->environment('testing')) {
            $defaultConnection = (string) $app['config']->get('database.default');
            $databaseName = (string) $app['config']->get("database.connections.{$defaultConnection}.database");

            if ($databaseName !== 'backend_test') {
                throw new RuntimeException("Unsafe test database configured: '{$databaseName}'. Expected 'backend_test'.");
            }
        }

        return $app;
    }
}
