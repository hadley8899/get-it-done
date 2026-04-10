<?php

namespace Tests\Feature\Api\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use Laravel\Passport\Passport;
use Tests\Feature\Api\ApiTestCase;

class WorkspaceInviteActionsTest extends ApiTestCase
{
    public function test_invite_creates_invite_for_existing_user_email(): void
    {
        $inviter = User::factory()->create();
        $existingUser = User::factory()->create(['email' => 'existing-user@example.com']);
        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);
        Passport::actingAs($inviter);

        $response = $this->postJson('/workspace-members/invite', [
            'email' => $existingUser->email,
            'workspace_uuid' => $workspace->uuid,
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure(['success']);

        $this->assertDatabaseHas('workspace_invites', [
            'email' => $existingUser->email,
            'workspace_id' => $workspace->id,
            'user_id' => $inviter->id,
        ]);
    }

    public function test_invite_creates_invite_for_unknown_email(): void
    {
        $inviter = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);
        Passport::actingAs($inviter);

        $response = $this->postJson('/workspace-members/invite', [
            'email' => 'new-user@example.com',
            'workspace_uuid' => $workspace->uuid,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('workspace_invites', [
            'email' => 'new-user@example.com',
            'workspace_id' => $workspace->id,
            'user_id' => $inviter->id,
        ]);
    }

    public function test_invite_fails_after_more_than_five_existing_invites(): void
    {
        $inviter = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $inviter->id]);
        Passport::actingAs($inviter);

        for ($i = 0; $i < 6; $i++) {
            WorkspaceInvite::query()->create([
                'email' => 'invite-limit@example.com',
                'user_id' => $inviter->id,
                'workspace_id' => $workspace->id,
                'expires_at' => now()->addWeek(),
            ]);
        }

        $response = $this->postJson('/workspace-members/invite', [
            'email' => 'invite-limit@example.com',
            'workspace_uuid' => $workspace->uuid,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Workspace invite limit reached');
    }

    public function test_accept_invite_creates_workspace_member_and_deletes_invite(): void
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invitee-accept@example.com']);
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        Passport::actingAs($invitedUser);

        $invite = WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $owner->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->postJson('/workspace-members/accept-invite', [
            'invite' => $invite->uuid,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $invitedUser->id,
        ]);

        $this->assertDatabaseMissing('workspace_invites', ['id' => $invite->id]);
    }

    public function test_accept_invite_rejects_invite_for_different_logged_in_user(): void
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invitee-mismatch@example.com']);
        $otherUser = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        Passport::actingAs($otherUser);

        $invite = WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $owner->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->postJson('/workspace-members/accept-invite', [
            'invite' => $invite->uuid,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Invalid user for invite');
    }

    public function test_reject_invite_deletes_invite_for_matching_user(): void
    {
        $owner = User::factory()->create();
        $invitedUser = User::factory()->create(['email' => 'invitee-reject@example.com']);
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);
        Passport::actingAs($invitedUser);

        $invite = WorkspaceInvite::query()->create([
            'email' => $invitedUser->email,
            'user_id' => $owner->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->postJson('/workspace-members/reject-invite', [
            'invite' => $invite->uuid,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('workspace_invites', ['id' => $invite->id]);
    }
}

