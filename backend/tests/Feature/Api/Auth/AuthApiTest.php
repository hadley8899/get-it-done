<?php

namespace Tests\Feature\Api\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class AuthApiTest extends ApiTestCase
{
	public function test_register_returns_token_and_user_payload(): void
	{
		$payload = [
			'name' => 'Test User',
			'email' => 'register-test@example.com',
			'password' => 'password123',
			'c_password' => 'password123',
		];

		$response = $this->postJson('/register', $payload);

		$response
			->assertOk()
			->assertJsonPath('success', true)
			->assertJsonPath('data.user.email', $payload['email'])
			->assertJsonStructure([
				'data' => [
					'token',
					'user' => ['uuid', 'name', 'email', 'avatar', 'is_verified'],
				],
			]);

		$this->assertDatabaseHas('users', ['email' => $payload['email']]);
	}

	public function test_login_returns_access_token_for_valid_credentials(): void
	{
		$password = 'password123';

		$user = User::factory()->create([
			'email' => 'login-success@example.com',
			'password' => Hash::make($password),
		]);

		$response = $this->postJson('/login', [
			'email' => $user->email,
			'password' => $password,
		]);

		$response
			->assertOk()
			->assertJsonStructure(['token']);
	}

	public function test_login_rejects_invalid_credentials(): void
	{
		$user = User::factory()->create([
			'email' => 'login-fail@example.com',
			'password' => Hash::make('correct-password'),
		]);

		$response = $this->postJson('/login', [
			'email' => $user->email,
			'password' => 'wrong-password',
		]);

		$response
			->assertStatus(422)
			->assertJsonPath('message', 'Credentials are incorrect');
	}

	public function test_user_details_returns_current_user_when_authenticated(): void
	{
		$user = User::factory()->create();
		Passport::actingAs($user);

		$response = $this->getJson('/user/details');

		$response
			->assertOk()
			->assertJsonPath('data.email', $user->email)
			->assertJsonPath('data.uuid', $user->uuid);
	}
}



