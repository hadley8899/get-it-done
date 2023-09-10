<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\Workspace\StoreWorkspaceRequest;
use App\Http\Requests\Workspace\UpdateWorkspaceRequest;
use App\Http\Resources\Workspace\WorkspaceCollection;
use App\Http\Resources\Workspace\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     */
    public function index(): JsonResponse
    {
        $userId = AuthHelper::getLoggedInUserId();
        // Fetch workspaces the user owns
        $ownedWorkspaces = Workspace::query()
            ->with(['user'])
            ->where('user_id', '=', $userId)
            ->select('workspaces.*');  // This line ensures only workspace columns are selected

        // Fetch workspaces the user has access to (is a member of)
        $memberWorkspaces = Workspace::query()
            ->join('workspace_members', 'workspaces.id', '=', 'workspace_members.workspace_id')
            ->where('workspace_members.user_id', '=', $userId)
            ->select('workspaces.*');

        // Combine both queries
        $workspaces = $ownedWorkspaces
            ->union($memberWorkspaces)
            ->get();

        return response()->json(new WorkspaceCollection(WorkspaceResource::collection($workspaces)));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreWorkspaceRequest $request
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = AuthHelper::getLoggedInUserId();

        $workspace = new Workspace($validated);

        // Check if there is already a workspace with the same name
        $existingWorkspace = Workspace::query()->where('user_id', '=', AuthHelper::getLoggedInUserId())->where('name', '=', $workspace->name)->first();

        if ($existingWorkspace) {
            throw WorkspaceException::workspaceSameName();
        }

        $workspace = Workspace::query()->create($validated);

        return response()->json(new WorkspaceResource($workspace));
    }

    /**
     * Display the specified resource.
     *
     * @param Workspace $workspace
     * @return JsonResponse
     */
    public function show(Workspace $workspace): JsonResponse
    {
        return response()->json(new WorkspaceResource($workspace));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateWorkspaceRequest $request
     * @param Workspace $workspace
     * @return JsonResponse
     */
    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $workspace->update($request->validated());

        return response()->json(new WorkspaceResource($workspace));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Workspace $workspace
     * @return JsonResponse
     */
    public function destroy(Workspace $workspace): JsonResponse
    {
        $workspace->members()->delete();
        $workspace->delete();

        return response()->json(['success' => true]);
    }
}
