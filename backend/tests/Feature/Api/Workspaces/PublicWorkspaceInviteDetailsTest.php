<?php

namespace Tests\Feature\Api\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use Tests\Feature\Api\ApiTestCase;

class PublicWorkspaceInviteDetailsTest extends ApiTestCase
{
    public function test_public_details_returns_invite_when_not_expired(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        $invite = WorkspaceInvite::query()->create([
            'email' => 'details-active@example.com',
            'user_id' => $owner->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->addWeek(),
        ]);

        $response = $this->getJson("/workspace-members/details/{$invite->uuid}");

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.uuid', $invite->uuid)
            ->assertJsonPath('data.email', $invite->email);
    }

    public function test_public_details_rejects_expired_invite(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['user_id' => $owner->id]);

        $invite = WorkspaceInvite::query()->create([
            'email' => 'details-expired@example.com',
            'user_id' => $owner->id,
            'workspace_id' => $workspace->id,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->getJson("/workspace-members/details/{$invite->uuid}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Workspace Invite expired');
    }
}

