<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
use App\Http\Requests\TaskComments\StoreTaskCommentRequest;
use App\Http\Requests\TaskComments\UpdateTaskCommentRequest;
use App\Http\Resources\Task\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;

class TaskCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Task $task
     * @return JsonResponse
     */
    public function index(Task $task): JsonResponse
    {
        return response()->json(TaskCommentResource::collection($task->comments));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Task $task
     * @param StoreTaskCommentRequest $request
     * @return JsonResponse
     */
    public function store(Task $task, StoreTaskCommentRequest $request): JsonResponse
    {
        $postData = $request->validated();
        $postData['task_id'] = $task->id;
        $postData['user_id'] = AuthHelper::getLoggedInUser()->id;

        $taskComment = TaskComment::query()->create($postData);

        return response()->json(new TaskCommentResource($taskComment), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param TaskComment $taskComment
     * @return JsonResponse
     */
    public function show(TaskComment $taskComment): JsonResponse
    {
        return response()->json(new TaskCommentResource($taskComment));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Task $task
     * @param UpdateTaskCommentRequest $request
     * @param TaskComment $taskComment
     * @return JsonResponse
     */
    public function update(Task $task, UpdateTaskCommentRequest $request, TaskComment $taskComment): JsonResponse
    {
        $taskComment->update($request->validated());

        return response()->json(new TaskCommentResource($taskComment));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Task $task
     * @param TaskComment $taskComment
     * @return JsonResponse
     */
    public function destroy(Task $task, TaskComment $taskComment): JsonResponse
    {
        $taskComment->delete();

        return response()->json(null, 204);
    }
}
