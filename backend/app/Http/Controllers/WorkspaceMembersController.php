<?php

namespace App\Http\Controllers;

use App\Core\Services\WorkspaceInvite\WorkspaceInviteAcceptService;
use App\Core\Services\WorkspaceInvite\WorkspaceInviteDetailsService;
use App\Core\Services\WorkspaceInvite\WorkspaceInviteRejectService;
use App\Core\Services\WorkspaceInvite\WorkspaceInviteService;
use App\Exceptions\UserException;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\WorkspaceMembers\StoreWorkspaceMembersRequest;
use App\Http\Requests\WorkspaceMembers\UpdateWorkspaceMembersRequest;
use App\Http\Requests\WorkspaceMembers\WorkspaceMemberInviteRequest;
use App\Http\Resources\WorkspaceMember\WorkspaceMemberResource;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvite;
use App\Models\WorkspaceMember;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Throwable;

class WorkspaceMembersController extends Controller
{
    public function invitesForUser(): AnonymousResourceCollection
    {
        return WorkspaceInviteService::invitesForUser();
    }

    /**
     * @throws Throwable
     * @throws UserException
     * @throws WorkspaceException
     */
    public function acceptInvite(Request $request): JsonResponse
    {
        $uuid = $request->get('invite');

        /** @var WorkspaceInvite $workspaceInvite */
        $workspaceInvite = WorkspaceInvite::query()->where('uuid', '=', $uuid)->firstOrFail();

        return WorkspaceInviteAcceptService::acceptInvite($workspaceInvite);
    }

    /**
     * @throws UserException
     * @throws WorkspaceException
     */
    public function rejectInvite(Request $request): JsonResponse
    {
        $uuid = $request->get('invite');

        /** @var WorkspaceInvite $workspaceInvite */
        $workspaceInvite = WorkspaceInvite::query()->where('uuid', '=', $uuid)->firstOrFail();

        return WorkspaceInviteRejectService::rejectInvite($workspaceInvite);
    }

    /**
     * @throws WorkspaceException
     */
    public function removeMember(WorkspaceMember $workspaceMember): JsonResponse
    {
        return WorkspaceInviteService::removeMember($workspaceMember);
    }

    /**
     * @throws WorkspaceException
     * @throws Exception
     * @throws Throwable
     */
    public function invite(WorkspaceMemberInviteRequest $request): JsonResponse
    {
        return WorkspaceInviteService::inviteEmail($request);
    }

    /**
     * @throws WorkspaceException
     */
    public function details(WorkspaceInvite $workspaceInvite): JsonResponse
    {
        return WorkspaceInviteDetailsService::workspaceInviteDetails($workspaceInvite);
    }

    /**
     * Display a listing of the resource.
     *
     * @param Workspace $workspace
     * @return JsonResponse
     */
    public function index(Workspace $workspace): JsonResponse
    {
        $workspaceMembers = WorkspaceMember::query()
            ->where('workspace_id', '=', $workspace->id)
            ->get();

        $ownerWorkspaceMember = new WorkspaceMember([
            'uuid' => null,
            'user_id' => $workspace->user()->firstOrFail()->id,
        ]);

        $workspaceMembers->push($ownerWorkspaceMember);

        return response()->json(WorkspaceMemberResource::collection($workspaceMembers));
    }
}
