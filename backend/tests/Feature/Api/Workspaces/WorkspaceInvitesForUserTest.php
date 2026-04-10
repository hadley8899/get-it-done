<?php

namespace Tests\Feature\Api\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class WorkspaceInvitesForUserTest extends ApiTestCase
{
    public function test_invites_for_user_returns_only_invites_for_logged_in_email(): void
    {
        $invitedUser = User::factory()->create(['email' => 'invitee@example.com']);
        $inviter = User::factory()->create();
        Passport::actingAs($invitedUser);

        $workspaceForUser = Workspace::factory()->create(['user_id' => $inviter->id]);
        $otherWorkspace = Workspace::factory()->create(['user_id' => $inviter->id]);

        WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $inviter->id,
            'workspace_id' => $workspaceForUser->id,
            'expires_at' => now()->addWeek(),
        ]);

        WorkspaceInvite::query()->create([
            'email' => 'another-user@example.com',
            'user_id' => $inviter->id,
            'workspace_id' => $otherWorkspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->getJson('/workspace-members/invites-for-user');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['email' => $invitedUser->email])
            ->assertJsonMissing(['email' => 'another-user@example.com']);
    }

    public function test_invites_for_user_prunes_invite_if_workspace_no_longer_exists(): void
    {
        $invitedUser = User::factory()->create(['email' => 'invitee-prune-workspace@example.com']);
        $inviter = User::factory()->create();
        Passport::actingAs($invitedUser);

        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);

        $invite = WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $inviter->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $workspace->delete();

        $response = $this->getJson('/workspace-members/invites-for-user');

        $response
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->assertDatabaseMissing('workspace_invites', ['id' => $invite->id]);
    }

    public function test_invites_for_user_prunes_invite_when_user_already_has_workspace_access(): void
    {
        $invitedUser = User::factory()->create(['email' => 'invitee-prune-member@example.com']);
        $inviter = User::factory()->create();
        Passport::actingAs($invitedUser);

        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);

        WorkspaceMember::factory()->create([
            'workspace_id' => $workspace->id,
            'user_id' => $invitedUser->id,
        ]);

        $invite = WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $inviter->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->getJson('/workspace-members/invites-for-user');

        $response
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->assertDatabaseMissing('workspace_invites', ['id' => $invite->id]);
    }
}

