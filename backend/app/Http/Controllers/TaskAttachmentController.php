<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\Tasks\StoreTaskAttachmentRequest;
use App\Http\Resources\Task\TaskAttachmentResource;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TaskAttachmentController extends Controller
{
    /**
     * @throws WorkspaceException
     */
    public function store(Task $task, StoreTaskAttachmentRequest $request): JsonResponse
    {
        $this->ensureTaskWorkspaceAccess($task);

        $file = $request->file('file');
        $extension = strtolower((string) $file->getClientOriginalExtension());
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();
        $isImage = Str::startsWith((string) $mimeType, 'image/')
            || StoreTaskAttachmentRequest::isImageExtension($extension);
        $storedFilename = Str::random(40) . ($extension !== '' ? ".$extension" : '');
        $storagePath = $file->storeAs(
            "task-attachments/$task->uuid",
            $storedFilename
        );

        $attachment = TaskAttachment::query()->create([
            'task_id' => $task->id,
            'user_id' => AuthHelper::getLoggedInUserId(),
            'original_name' => $file->getClientOriginalName(),
            'storage_path' => $storagePath,
            'disk' => 'local',
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size_bytes' => $file->getSize() ?? 0,
            'is_image' => $isImage,
        ]);

        return response()->json(new TaskAttachmentResource($attachment), Response::HTTP_CREATED);
    }

    /**
     * @throws WorkspaceException
     */
    public function content(Task $task, TaskAttachment $taskAttachment): StreamedResponse
    {
        $this->ensureTaskWorkspaceAccess($task);
        $this->ensureAttachmentBelongsToTask($task, $taskAttachment);

        if (!Storage::disk($taskAttachment->disk)->exists($taskAttachment->storage_path)) {
            abort(404);
        }

        return Storage::disk($taskAttachment->disk)->response(
            $taskAttachment->storage_path,
            $taskAttachment->original_name,
            [
                'Cache-Control' => 'private, max-age=300',
                'Content-Type' => $taskAttachment->mime_type ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . addslashes($taskAttachment->original_name) . '"',
            ]
        );
    }

    /**
     * @throws WorkspaceException
     */
    public function destroy(Task $task, TaskAttachment $taskAttachment): JsonResponse
    {
        $this->ensureTaskWorkspaceAccess($task);
        $this->ensureAttachmentBelongsToTask($task, $taskAttachment);

        $taskAttachment->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @throws WorkspaceException
     */
    private function ensureTaskWorkspaceAccess(Task $task): void
    {
        $workspace = $task->boardList()->firstOrFail()->board()->firstOrFail()->workspace()->firstOrFail();

        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }
    }

    private function ensureAttachmentBelongsToTask(Task $task, TaskAttachment $taskAttachment): void
    {
        if ($taskAttachment->task_id !== $task->id) {
            abort(404);
        }
    }
}
