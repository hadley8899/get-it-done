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

        try {
            $clientRepository->personalAccessClient();
        } catch (RuntimeException) {
            $clientRepository->createPersonalAccessClient(
                null,
                'Test Personal Access Client',
                'http://localhost'
            );
        }
    }
}

