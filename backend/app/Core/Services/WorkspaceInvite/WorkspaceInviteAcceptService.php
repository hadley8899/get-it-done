<?php

namespace App\Core\Services\WorkspaceInvite;

use App\Exceptions\UserException;
use App\Exceptions\WorkspaceException;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Throwable;

class WorkspaceInviteAcceptService extends WorkspaceInviteServiceAbstract
{
    /**
     * @param WorkspaceInvite $workspaceInvite
     * @return JsonResponse
     * @throws UserException
     * @throws WorkspaceException
     * @throws Throwable
     */
    public static function acceptInvite(WorkspaceInvite $workspaceInvite): JsonResponse
    {
        self::checkIfExpired($workspaceInvite);

        [$user, $workspace] = self::checkDetailsForInvite($workspaceInvite);

        // Make sure the user doesnt already exist in the workspace members
        $workspaceMember = WorkspaceMember::query()
            ->where('user_id', '=', $user->id)
            ->where('workspace_id', '=', $workspace->id)
            ->first();

        if ($workspaceMember) {
            $workspaceInvite->delete();
            throw new UserException('User already exists in workspace');
        }

        $workspaceMember = new WorkspaceMember([
            'user_id' => $user->id,
            'workspace_id' => $workspace->id,
        ]);

        $workspaceMember->saveOrFail();

        $workspaceInvite->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
