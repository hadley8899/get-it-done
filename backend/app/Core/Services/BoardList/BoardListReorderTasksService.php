<?php

namespace App\Core\Services\BoardList;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\WorkspaceException;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Throwable;

class BoardListReorderTasksService
{
    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function reorderTasks(Workspace $workspace, Board $board, BoardList $boardList, Request $request): JsonResponse
    {
        // Ensure the user has access to this workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the board belongs to the workspace
        if ($board->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the board list belongs to the board
        if ($boardList->board_id !== $board->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        $taskUuIds = $request->get('uuids');

        $tasks = Task::query()->whereIn('uuid', $taskUuIds)->get('id');

        if (count($tasks) !== count($taskUuIds)) {
            return response()->json(['success' => false, 'errorMessages' => ['Invalid task UUIDs']], Response::HTTP_BAD_REQUEST);
        }

        $position = 1;
        // The task uuids come over from the frontend in the order they should be in
        foreach ($taskUuIds as $taskUuId) {
            $task = Task::query()->where('uuid', '=', $taskUuId)->first();
            if (!$task) {
                continue;
            }
            $task->position = $position;
            // As we are only reordering the list, Don't update the timestamps
            $task->timestamps = false;
            $task->saveOrFail();
            $position++;
        }

        return response()->json(['success' => true], Response::HTTP_OK);
    }
}
