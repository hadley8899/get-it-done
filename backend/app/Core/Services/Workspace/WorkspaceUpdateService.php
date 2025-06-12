<?php

namespace App\Core\Services\Workspace;

use App\Models\Workspace;

class WorkspaceUpdateService
{
    public static function updateWorkspace(Workspace $workspace, $validated): Workspace
    {
        $workspace->update($validated);

        return $workspace;
    }
}
