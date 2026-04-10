<?php

namespace Tests\Feature\Api\Boards;

use App\Models\Board;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class BoardCrudTest extends ApiTestCase
{
    public function test_index_returns_boards_for_workspace(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $boardA = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => 'Board A',
        ]);

        $boardB = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => 'Board B',
        ]);

        $otherWorkspace = Workspace::factory()->create(['user_id' => $user->id]);
        $otherBoard = Board::factory()->create([
            'workspace_id' => $otherWorkspace->id,
            'user_id' => $user->id,
            'name' => 'Other Workspace Board',
        ]);

        $response = $this->getJson("/boards/{$workspace->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('data.0.uuid', $boardA->uuid)
            ->assertJsonFragment(['name' => $boardA->name])
            ->assertJsonFragment(['name' => $boardB->name])
            ->assertJsonMissing(['name' => $otherBoard->name]);
    }

    public function test_store_creates_board_for_workspace(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        $payload = [
            'name' => 'New Board',
            'description' => 'Board description',
            'color' => '#123456',
            'icon' => 'dashboard',
        ];

        $response = $this->postJson("/boards/{$workspace->uuid}", $payload);

        $response
            ->assertStatus(201)
            ->assertJsonPath('name', $payload['name'])
            ->assertJsonPath('description', $payload['description'])
            ->assertJsonPath('color', $payload['color'])
            ->assertJsonPath('icon', $payload['icon']);

        $this->assertDatabaseHas('boards', [
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => $payload['name'],
        ]);
    }

    public function test_store_rejects_duplicate_board_name_in_same_workspace(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspace = Workspace::factory()->create(['user_id' => $user->id]);

        Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'name' => 'Duplicate Board',
        ]);

        $response = $this->postJson("/boards/{$workspace->uuid}", [
            'name' => 'Duplicate Board',
            'description' => 'Second board',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Board with that name already exists');
    }

    public function test_store_allows_same_board_name_in_different_workspaces(): void
    {
        $user = User::factory()->create();
        Passport::actingAs($user);

        $workspaceA = Workspace::factory()->create(['user_id' => $user->id]);
        $workspaceB = Workspace::factory()->create(['user_id' => $user->id]);

        Board::factory()->create([
            'workspace_id' => $workspaceA->id,
            'user_id' => $user->id,
            'name' => 'Shared Name',
        ]);

        $response = $this->postJson("/boards/{$workspaceB->uuid}", [
            'name' => 'Shared Name',
            'description' => 'Allowed in different workspace',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('boards', [
            'workspace_id' => $workspaceB->id,
            'name' => 'Shared Name',
        ]);
    }

    public function test_update_updates_board_when_request_user_is_board_owner(): void
    {
        $owner = User::factory()->create();
        Passport::actingAs($owner);

        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
            'name' => 'Old Name',
            'description' => 'Old Description',
        ]);

        $payload = [
            'name' => 'Updated Board',
            'description' => 'Updated Description',
            'color' => '#abcdef',
            'icon' => 'task',
        ];

        $response = $this->putJson("/boards/{$workspace->uuid}/{$board->uuid}", $payload);

        $response
            ->assertOk()
            ->assertJsonPath('name', $payload['name'])
            ->assertJsonPath('description', $payload['description'])
            ->assertJsonPath('color', $payload['color'])
            ->assertJsonPath('icon', $payload['icon']);

        $this->assertDatabaseHas('boards', [
            'id' => $board->id,
            'name' => $payload['name'],
            'description' => $payload['description'],
            'color' => $payload['color'],
            'icon' => $payload['icon'],
        ]);
    }

    public function test_update_rejects_non_owner_of_board(): void
    {
        $boardOwner = User::factory()->create();
        $otherUser = User::factory()->create();
        Passport::actingAs($otherUser);

        $workspace = Workspace::factory()->create(['user_id' => $boardOwner->id]);

        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $boardOwner->id,
            'name' => 'Owned Board',
        ]);

        $response = $this->putJson("/boards/{$workspace->uuid}/{$board->uuid}", [
            'name' => 'Should Fail',
            'description' => 'No permission',
        ]);

        $response->assertStatus(403);
    }

    public function test_destroy_soft_deletes_board_for_workspace_member_with_access(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        Passport::actingAs($member);

        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);

        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
        ]);

        $response = $this->deleteJson("/boards/{$workspace->uuid}/{$board->uuid}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('boards', ['id' => $board->id]);
    }

    public function test_destroy_rejects_user_without_workspace_access(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        Passport::actingAs($outsider);

        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        $board = Board::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $owner->id,
        ]);

        $response = $this->deleteJson("/boards/{$workspace->uuid}/{$board->uuid}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Workspace does not exist');

        $this->assertDatabaseHas('boards', ['id' => $board->id, 'deleted_at' => null]);
    }
}


