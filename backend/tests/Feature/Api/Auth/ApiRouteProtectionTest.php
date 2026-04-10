<?php

namespace Tests\Feature\Api\Auth;

use Tests\Feature\Api\ApiTestCase;

class ApiRouteProtectionTest extends ApiTestCase
{
    /**
     * @dataProvider protectedRouteProvider
     */
    public function test_protected_routes_return_401_without_token(string $method, string $uri): void
    {
        $response = $this
            ->withHeaders([
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->json($method, $uri);

        $response->assertStatus(401);
    }

    public function test_public_auth_routes_are_not_guarded_by_auth_middleware(): void
    {
        $loginResponse = $this->postJson('/login', []);
        $registerResponse = $this->postJson('/register', []);

        $loginResponse->assertStatus(422);
        $registerResponse->assertStatus(422);
    }

    public static function protectedRouteProvider(): array
    {
        return [
            ['GET', '/user/details'],
            ['GET', '/workspaces'],
            ['POST', '/workspaces'],
            ['GET', '/boards/11111111-1111-1111-1111-111111111111'],
            ['POST', '/boards/11111111-1111-1111-1111-111111111111'],
        ];
    }
}



