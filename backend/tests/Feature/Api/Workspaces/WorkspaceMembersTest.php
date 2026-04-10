<?php

namespace Tests\Feature\Api\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class WorkspaceMembersTest extends ApiTestCase
{
    public function test_workspace_members_index_returns_owner_and_members(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $member = User::factory()->create(['email' => 'member@example.com']);
        Passport::actingAs($owner);

        $workspace = Workspace::factory()->create([
            'user_id' => $owner->id,
        ]);

        WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);

        $response = $this->getJson("/workspaces/{$workspace->uuid}/members");

        $response
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['email' => $owner->email])
            ->assertJsonFragment(['email' => $member->email]);
    }

    public function test_remove_member_deletes_member_when_request_user_has_workspace_access(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        Passport::actingAs($owner);

        $workspace = Workspace::factory()->create([
            'user_id' => $owner->id,
        ]);

        $workspaceMember = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);

        $response = $this->deleteJson("/workspace-members/remove-member/{$workspaceMember->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('workspace_members', ['id' => $workspaceMember->id]);
    }

    public function test_remove_member_rejects_user_without_access_to_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();
        Passport::actingAs($outsider);

        $workspace = Workspace::factory()->create([
            'user_id' => $owner->id,
        ]);

        $workspaceMember = WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);

        $response = $this->deleteJson("/workspace-members/remove-member/{$workspaceMember->uuid}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', "You don't have access to this workspace");

        $this->assertDatabaseHas('workspace_members', ['id' => $workspaceMember->id]);
    }
}


