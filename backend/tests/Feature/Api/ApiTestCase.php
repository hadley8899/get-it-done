<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\ClientRepository;
use RuntimeException;
use Tests\TestCase;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ensurePassportPersonalAccessClient();
    }

    private function ensurePassportPersonalAccessClient(): void
    {
        $clientRepository = app(ClientRepository::class);
        $provider = (string) config('auth.guards.api.provider', 'users');

        try {
            $clientRepository->personalAccessClient($provider);
        } catch (RuntimeException) {
            $clientRepository->createPersonalAccessGrantClient(
                'Test Personal Access Client',
                $provider
            );
        }
    }
}

