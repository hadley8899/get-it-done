<?php

namespace Tests\Feature\Api\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class WorkspaceCrudTest extends ApiTestCase
{
    public function test_index_returns_owned_and_member_workspaces(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        Passport::actingAs($user);

        $ownedWorkspace = Workspace::factory()->create([
            'user_id' => $user->id,
            'name' => 'Owned Workspace',
        ]);

        $memberWorkspace = Workspace::factory()->create([
            'user_id' => $owner->id,
            'name' => 'Member Workspace',
        ]);

        WorkspaceMember::factory()->create([
            'workspace_id' => $memberWorkspace->id,
            'user_id' => $user->id,
        ]);

        $excludedWorkspace = Workspace::factory()->create([
            'user_id' => $owner->id,
            'name' => 'Excluded Workspace',
        ]);

        $response = $this->getJson('/workspaces');

        $response->assertOk();
        $response->assertJsonFragment(['name' => $ownedWorkspace->name]);
        $response->assertJsonFragment(['name' => $memberWorkspace->name]);
        $response->assertJsonMissing(['name' => $excludedWorkspace->name]);
    }

    public function test_store_creates_workspace_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $payload = [
            'name' => 'QA Workspace',
            'description' => 'Workspace for tests',
        ];

        $response = $this->postJson('/workspaces', $payload);

        $response
            ->assertOk()
            ->assertJsonPath('name', $payload['name'])
            ->assertJsonPath('description', $payload['description']);

        $this->assertDatabaseHas('workspaces', [
            'name' => $payload['name'],
            'description' => $payload['description'],
            'user_id' => $user->id,
        ]);
    }

    public function test_store_rejects_duplicate_workspace_name_for_same_owner(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        Workspace::factory()->create([
            'user_id' => $user->id,
            'name' => 'Duplicate Name',
        ]);

        $response = $this->postJson('/workspaces', [
            'name' => 'Duplicate Name',
            'description' => 'Another description',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'There is already a workspace with this name');
    }

    public function test_update_changes_workspace_fields(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create([
            'user_id' => $user->id,
            'name' => 'Original Name',
            'description' => 'Original Description',
        ]);

        $payload = [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
        ];

        $response = $this->putJson("/workspaces/{$workspace->uuid}", $payload);

        $response
            ->assertOk()
            ->assertJsonPath('name', $payload['name'])
            ->assertJsonPath('description', $payload['description']);

        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => $payload['name'],
            'description' => $payload['description'],
        ]);
    }

    public function test_destroy_soft_deletes_workspace(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create([
            'user_id' => $user->id,
        ]);

        $response = $this->deleteJson("/workspaces/{$workspace->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('workspaces', ['id' => $workspace->id]);
    }
}


