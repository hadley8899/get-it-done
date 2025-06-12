<?php

namespace App\Core\Services\Workspace;

use App\Core\Services\Auth\AuthHelper;
use App\Exceptions\WorkspaceException;
use App\Models\Workspace;

class WorkspaceStoreService
{
    /**
     * @param $validated
     * @return Workspace
     * @throws WorkspaceException
     */
    public static function storeWorkspace($validated): Workspace
    {
        $workspace = new Workspace($validated);

        // Check if there is already a workspace with the same name
        $existingWorkspace = Workspace::query()->where('user_id', '=', AuthHelper::getLoggedInUserId())->where('name', '=', $workspace->name)->first();

        if ($existingWorkspace) {
            throw WorkspaceException::workspaceSameName();
        }

        return Workspace::query()->create($validated);
    }
}
