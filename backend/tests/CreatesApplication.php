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
