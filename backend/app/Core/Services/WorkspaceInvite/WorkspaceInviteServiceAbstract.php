<?php

namespace App\Core\Services\WorkspaceInvite;

use App\Core\Services\Auth\AuthHelper;
use App\Exceptions\UserException;
use App\Exceptions\WorkspaceException;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use Carbon\Carbon;

abstract class WorkspaceInviteServiceAbstract
{
    /**
     * @param WorkspaceInvite $workspaceInvite
     * @return array
     * @throws UserException
     * @throws WorkspaceException
     */
    protected static function checkDetailsForInvite(WorkspaceInvite $workspaceInvite): array
    {
        $workspace = Workspace::query()->findOrFail($workspaceInvite->workspace_id);

        $user = User::query()->where('email', '=', $workspaceInvite->email)->first();

        if ($user === null) {
            throw UserException::userNotFound();
        }

        if ((int)$user->id === (int)$workspace->user_id) {
            throw WorkspaceException::cannotInviteOwner();
        }

        // Does the invite match the logged-in user
        if ($user->id !== AuthHelper::getLoggedInUserId()) {
            throw WorkspaceException::inviteDoesNotMatch();
        }

        return [$user, $workspace];
    }

    /**
     * @throws WorkspaceException
     */
    protected static function checkIfExpired(WorkspaceInvite $workspaceInvite): void
    {
        $expires = Carbon::parse($workspaceInvite->expires_at);

        // Check if the invite is still valid
        if ($expires->isPast()) {
            throw WorkspaceException::inviteExpired();
        }
    }
}
