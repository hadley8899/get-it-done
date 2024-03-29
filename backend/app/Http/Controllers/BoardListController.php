<?php

namespace App\Http\Controllers;

use App\Core\Services\BoardList\BoardListDeleteService;
use App\Core\Services\BoardList\BoardListMoveTaskService;
use App\Core\Services\BoardList\BoardListReorderService;
use App\Core\Services\BoardList\BoardListReorderTasksService;
use App\Core\Services\BoardList\BoardListStoreService;
use App\Core\Services\BoardList\BoardListsWithTasksService;
use App\Core\Services\BoardList\BoardListUpdateService;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\Boards\StoreBoardListRequest;
use App\Http\Requests\Boards\UpdateBoardListRequest;
use App\Http\Resources\Board\BoardListResource;
use App\Http\Resources\BoardLists\BoardListWithTasksResource;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Throwable;

class BoardListController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @throws WorkspaceException
     */
    public function listsForBoard(Workspace $workspace, Board $board): JsonResponse
    {
        return response()->json(BoardListWithTasksResource::collection((new BoardListsWithTasksService())->boardListsWithTasks($workspace, $board)));
    }

    /**
     * @throws WorkspaceException
     */
    public function listsForBoardNoTasks(Workspace $workspace, Board $board): JsonResponse
    {
        return response()->json(BoardListResource::collection((new BoardListsWithTasksService())->boardListsWithTasks($workspace, $board)));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Workspace $workspace
     * @param Board $board
     * @param StoreBoardListRequest $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function store(Workspace $workspace, Board $board, StoreBoardListRequest $request): JsonResponse
    {
        $boardList = (new BoardListStoreService())->storeBoardList($workspace, $board, $request);

        return response()->json(new BoardListWithTasksResource($boardList), Response::HTTP_CREATED);
    }

    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function reorderTasks(Workspace $workspace, Board $board, BoardList $boardList, Request $request): JsonResponse
    {
        return (new BoardListReorderTasksService())->reorderTasks($workspace, $board, $boardList, $request);
    }

    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function reorderLists(Workspace $workspace, Board $board, Request $request): JsonResponse
    {
        (new BoardListReorderService())->reorderBoardList($workspace, $board, $request);

        return response()->json(null, Response::HTTP_OK);
    }

    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function moveTask(Workspace $workspace, Board $board, Request $request): JsonResponse
    {
        $response = (new BoardListMoveTaskService())->moveTask($workspace, $board, $request);

        return $response ?? response()->json(null, Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateBoardListRequest $request
     * @param Workspace $workspace
     * @param Board $board
     * @param BoardList $boardList
     * @return JsonResponse
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function update(UpdateBoardListRequest $request, Workspace $workspace, Board $board, BoardList $boardList): JsonResponse
    {
        (new BoardListUpdateService())->updateBoardList($workspace, $board, $boardList, $request->validated());

        return response()->json(new BoardListResource($boardList), Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Workspace $workspace
     * @param Board $board
     * @param BoardList $boardList
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function destroy(Workspace $workspace, Board $board, BoardList $boardList): JsonResponse
    {
        (new BoardListDeleteService())->deleteBoardList($workspace, $board, $boardList);

        return response()->json(['success' => true]);
    }
}
