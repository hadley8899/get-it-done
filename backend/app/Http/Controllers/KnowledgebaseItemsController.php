<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\KnowledgeBase\AddKnowledgebaseItemRequest;
use App\Http\Requests\KnowledgeBase\UpdateKnowledgebaseItemRequest;
use App\Http\Resources\Knowledgebase\KnowledgebaseItemCollection;
use App\Http\Resources\Knowledgebase\KnowledgebaseItemResource;
use App\Http\Resources\Knowledgebase\KnowledgebaseResource;
use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\KnowledgebaseItem;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class KnowledgebaseItemsController extends Controller
{
    /**
     * @throws WorkspaceException
     */
    public function items(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): JsonResponse
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Get all the knowledgebase items
        $items = $knowledgebase
            ->knowledgebaseItems()
            ->orderBy('position')
            ->get();

        return response()->json(new KnowledgebaseItemCollection(KnowledgebaseItemResource::collection($items)));
    }

    /**
     * @throws WorkspaceException
     */
    public function item(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem): JsonResponse
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase item belongs to the knowledgebase
        if ($knowledgebaseItem->knowledgebase_id !== $knowledgebase->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        return response()->json(new KnowledgebaseResource($knowledgebaseItem));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param AddKnowledgebaseItemRequest $addKnowledgebaseItemRequest
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function storeItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, AddKnowledgebaseItemRequest $addKnowledgebaseItemRequest): JsonResponse
    {
        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Create the knowledgebase item
        $knowledgebaseItem = new KnowledgebaseItem($addKnowledgebaseItemRequest->validated());
        $knowledgebaseItem->knowledgebase_id = $knowledgebase->id;

        // Find the next available position
        $knowledgebaseItem->position = KnowledgebaseItem::query()
                ->where('knowledgebase_id', $knowledgebase->id)
                ->max('position') + 1;

        $knowledgebaseItem->save();

        return response()->json(new KnowledgebaseItemResource($knowledgebaseItem));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param KnowledgebaseItem $knowledgebaseItem
     * @param UpdateKnowledgebaseItemRequest $updateKnowledgebaseItemRequest
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function updateItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem, UpdateKnowledgebaseItemRequest $updateKnowledgebaseItemRequest): JsonResponse
    {
        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase item belongs to the knowledgebase
        if ($knowledgebaseItem->knowledgebase_id !== $knowledgebase->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Update the knowledgebase item
        $knowledgebaseItem->update($updateKnowledgebaseItemRequest->validated());

        // Update the positions of other knowledgebase items
        $knowledgebaseItems = KnowledgebaseItem::query()
            ->where('knowledgebase_id', $knowledgebase->id)
            ->get();
        $position = 1;
        foreach ($knowledgebaseItems as $item) {
            $item->position = $position;
            $item->save();
            $position++;
        }

        return response()->json(new KnowledgebaseItemResource($knowledgebaseItem));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param KnowledgebaseItem $knowledgebaseItem
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function destroyItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem): JsonResponse
    {
        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase item belongs to the knowledgebase
        if ($knowledgebaseItem->knowledgebase_id !== $knowledgebase->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Delete the knowledgebase item
        $knowledgebaseItem->delete();

        // Update the positions of other knowledgebase items
        $knowledgebaseItems = KnowledgebaseItem::query()->where('knowledgebase_id', $knowledgebase->id)->get();
        $position = 1;
        foreach ($knowledgebaseItems as $item) {
            $item->position = $position;
            $item->save();
            $position++;
        }

        return response()->json(['success' => true]);
    }
}
