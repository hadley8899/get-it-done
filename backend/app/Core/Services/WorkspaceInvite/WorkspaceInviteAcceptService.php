<?php

namespace App\Core\Services\WorkspaceInvite;

use App\Exceptions\UserException;
use App\Exceptions\WorkspaceException;
use App\Mail\NotifyOfAcceptWorkspaceInvite;
use App\Models\User;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
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

        // Make sure the user doesn't already exist in the workspace members
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

        $notifyOfAcceptWorkspace = new NotifyOfAcceptWorkspaceInvite($user, $workspace);

        $userWhoInvited = User::query()->where('id', '=', $workspaceInvite->user_id)->firstOrFail();

        Mail::to($userWhoInvited->email)->send($notifyOfAcceptWorkspace);

        return response()->json([
            'success' => true,
        ]);
    }
}
