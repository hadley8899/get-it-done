<?php

namespace App\Core\Services\WorkspaceInvite;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\WorkspaceMembers\WorkspaceMemberInviteRequest;
use App\Http\Resources\WorkspaceInvite\WorkspaceInviteResource;
use App\Mail\UserSignupWorkspaceInvite;
use App\Mail\UserWorkspaceInvite;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Mail;
use Throwable;

class WorkspaceInviteService
{
    /**
     * @param WorkspaceMemberInviteRequest $request
     * @return JsonResponse
     * @throws WorkspaceException
     * @throws Throwable
     */
    public static function inviteEmail(WorkspaceMemberInviteRequest $request): JsonResponse
    {
        $email = $request->validated('email');

        // If there is already a user in the database, Get them
        $user = User::query()->where('email', '=', $email)->first();

        /** @var Workspace $workspace */
        $workspace = Workspace::fromUuId($request->get('workspace_uuid'));

        if ($workspace === null) {
            throw WorkspaceException::workspaceNotFound();
        }

        // Check if the email address has had an invitation sent to it.
        $invite = WorkspaceInvite::query()
            ->where('email', '=', $email)
            ->where('workspace_id', '=', $workspace->id)
            ->get();

        if (count($invite) > 5) {
            throw WorkspaceException::inviteLimitExceeded();
        }

        // Date 4 weeks from now
        $expiresAt = now()->addWeeks(4);

        // Create a row in the workspace_invites table for this user.
        $workspaceInvite = (new WorkspaceInvite([
            'email' => $email,
            'user_id' => AuthHelper::getLoggedInUserId(),
            'workspace_id' => $workspace->id,
            'expires_at' => $expiresAt,
        ]));

        $workspaceInvite->saveOrFail();

        if ($user === null) {
            return self::sendNewUserInviteEmail($workspaceInvite, $workspace, $email);
        }

        return self::sendUserInviteToWorkspace($workspaceInvite, $workspace, $email);
    }

    /**
     * @param WorkspaceInvite $workspaceInvite
     * @param Workspace $workspace
     * @param mixed $email
     * @return JsonResponse
     */
    public static function sendNewUserInviteEmail(WorkspaceInvite $workspaceInvite, Workspace $workspace, mixed $email): JsonResponse
    {
        // The person with this email address does not currently exist in the system.
        $userSignupInvite = new UserSignupWorkspaceInvite();
        $userSignupInvite->workspaceInvite = $workspaceInvite;
        $userSignupInvite->workspace = $workspace;

        Mail::to($email)->send($userSignupInvite);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * @param WorkspaceInvite $workspaceInvite
     * @param Workspace $workspace
     * @param mixed $email
     * @return JsonResponse
     */
    public static function sendUserInviteToWorkspace(WorkspaceInvite $workspaceInvite, Workspace $workspace, mixed $email): JsonResponse
    {
        $userWorkspaceInvite = new UserWorkspaceInvite();
        $userWorkspaceInvite->workspaceInvite = $workspaceInvite;
        $userWorkspaceInvite->workspace = $workspace;

        Mail::to($email)->send($userWorkspaceInvite);

        return response()->json([
            'success' => 'true',
        ]);
    }

    public static function invitesForUser(): AnonymousResourceCollection
    {
        AuthHelper::getLoggedInUser();

        $invites = WorkspaceInvite::query()
            ->where('email', '=', AuthHelper::getLoggedInUser()->email)
            ->get();

        $invites = self::deleteInvalidInvites($invites);

        return WorkspaceInviteResource::collection($invites);
    }

    /**
     * @param Collection $invites
     * @return Collection
     */
    public static function deleteInvalidInvites(Collection $invites): Collection
    {
        foreach ($invites as $k => $invite) {
            // Check if the user already has access to the workspace, If so just delete it
            /** @var User $invitedUser */
            $invitedUser = User::query()->where('email', '=', $invite->email)->first();

            if ($invitedUser === null) {
                continue;
            }

            /** @var Workspace|null $workspace */
            $workspace = Workspace::query()->where('id', '=', $invite->workspace_id)->first();

            if ($workspace === null) {
                // If the workspace does not exist, Neither should this invite
                $invite->delete();
                unset($invites[$k]);
                continue;
            }

            if (WorkspacePermissionService::userHasAccessToWorkspace($invitedUser, $workspace)) {
                $invite->delete();
                unset($invites[$k]);
            }
        }
        return $invites;
    }

    /**
     * @throws WorkspaceException
     */
    public static function removeMember(WorkspaceMember $workspaceMember): JsonResponse
    {
        /** @var Workspace $workspace */
        $workspace = $workspaceMember->workspace()->firstOrFail();

        // Ensure the logged in user has access to the workspace in question
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        $workspaceMember->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
