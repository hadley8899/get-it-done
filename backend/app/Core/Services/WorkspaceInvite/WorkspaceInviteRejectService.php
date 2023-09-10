<?php

namespace App\Core\Services\WorkspaceInvite;

use App\Exceptions\UserException;
use App\Exceptions\WorkspaceException;
use App\Models\WorkspaceInvite;
use Illuminate\Http\JsonResponse;

class WorkspaceInviteRejectService extends WorkspaceInviteServiceAbstract
{
    /**
     * @throws UserException
     * @throws WorkspaceException
     */
    public static function rejectInvite(WorkspaceInvite $workspaceInvite): JsonResponse
    {
        self::checkDetailsForInvite($workspaceInvite);

        $workspaceInvite->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
