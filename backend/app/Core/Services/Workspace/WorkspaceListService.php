<?php

namespace App\Core\Services\Workspace;

use App\Models\Workspace;

class WorkspaceListService
{
    public static function workspacesForUser($userId)
    {
        // Fetch workspaces the user owns
        $ownedWorkspaces = Workspace::query()
            ->with(['user'])
            ->where('user_id', '=', $userId)
            ->select('workspaces.*');

        // Fetch workspaces the user has access to (is a member of)
        $memberWorkspaces = Workspace::query()
            ->join('workspace_members', 'workspaces.id', '=', 'workspace_members.workspace_id')
            ->where('workspace_members.user_id', '=', $userId)
            ->select('workspaces.*');

        // Combine both queries
        return $ownedWorkspaces
            ->union($memberWorkspaces)
            ->get();
    }
}
