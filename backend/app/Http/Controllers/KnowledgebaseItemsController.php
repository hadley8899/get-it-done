<?php

namespace App\Http\Controllers;

use App\Core\Services\Knowledgebase\KnowledgebaseItemsService;
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
use Throwable;

class KnowledgebaseItemsController extends Controller
{
    /**
     * @throws WorkspaceException
     */
    public function items(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): JsonResponse
    {
        $items = (new KnowledgebaseItemsService())->fetchItemsForKnowledgebase($workspace, $knowledgebaseCategory, $knowledgebase);
        return response()->json(new KnowledgebaseItemCollection(KnowledgebaseItemResource::collection($items)));
    }

    /**
     * @throws WorkspaceException
     */
    public function item(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem): JsonResponse
    {
        $knowledgebaseItem = (new KnowledgebaseItemsService())->fetchKnowledgebaseItem($workspace, $knowledgebaseCategory, $knowledgebase, $knowledgebaseItem);
        return response()->json(new KnowledgebaseResource($knowledgebaseItem));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param AddKnowledgebaseItemRequest $addKnowledgebaseItemRequest
     * @return JsonResponse
     * @throws WorkspaceException
     * @throws Throwable
     */
    public function storeItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, AddKnowledgebaseItemRequest $addKnowledgebaseItemRequest): JsonResponse
    {
        $knowledgebaseItem = (new KnowledgebaseItemsService())->storeKnowledgebaseItem($workspace, $knowledgebaseCategory, $knowledgebase, $addKnowledgebaseItemRequest);

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
        $knowledgebaseItem = (new KnowledgebaseItemsService())->updateKnowledgebaseItem($workspace, $knowledgebaseCategory, $knowledgebase, $knowledgebaseItem, $updateKnowledgebaseItemRequest);
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
        (new KnowledgebaseItemsService())->deleteKnowledgebaseItem($workspace, $knowledgebaseCategory, $knowledgebase, $knowledgebaseItem);

        return response()->json(['success' => true]);
    }
}
