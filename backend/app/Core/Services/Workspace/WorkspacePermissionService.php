<?php

namespace App\Core\Services\Workspace;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;

class WorkspacePermissionService
{
    /**
     * @param User $user
     * @param Workspace $workspace
     * @return bool
     */
    public static function userHasAccessToWorkspace(User $user, Workspace $workspace): bool
    {
        if ($workspace->user_id === $user->id) {
            return true;
        }

        // If the user is a member of the workspace they have access
        $workspaceMember = WorkspaceMember::query()
            ->where('workspace_id', '=', $workspace->id)
            ->where('user_id', '=', $user->id)
            ->first();

        if (!$workspaceMember) {
            return false;
        }

        return true;
    }
}
