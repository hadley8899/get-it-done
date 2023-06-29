<?php

namespace App\Http\Controllers;

use App\Core\Services\BoardTemplate\BoardTemplateItems\BoardTemplateItemDeleteService;
use App\Core\Services\BoardTemplate\BoardTemplateItems\BoardTemplateItemService;
use App\Core\Services\BoardTemplate\BoardTemplateItems\BoardTemplateItemStoreService;
use App\Core\Services\BoardTemplate\BoardTemplateItems\BoardTemplateItemUpdateService;
use App\Http\Requests\BoardTemplate\BoardTemplateItem\StoreBoardTemplateItemRequest;
use App\Http\Requests\BoardTemplate\BoardTemplateItem\UpdateBoardTemplateItemRequest;
use App\Http\Resources\BoardTemplate\BoardTemplateItem\BoardTemplateItemCollection;
use App\Http\Resources\BoardTemplate\BoardTemplateItem\BoardTemplateItemResource;
use App\Models\BoardTemplate;
use App\Models\BoardTemplateItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class BoardTemplateItemController extends Controller
{
    public function index(BoardTemplate $boardTemplate): BoardTemplateItemCollection
    {
        return (new BoardTemplateItemService())->allForBoardTemplate($boardTemplate);
    }

    public function show(BoardTemplateItem $boardTemplateItem): BoardTemplateItemResource
    {
        return (new BoardTemplateItemService())->viewBoardTemplateItem($boardTemplateItem);
    }

    /**
     * @throws Throwable
     */
    public function store(StoreBoardTemplateItemRequest $request, BoardTemplate $boardTemplate): JsonResponse
    {
        (new BoardTemplateItemStoreService())->storeBoardTemplateItem($request->validated(), $boardTemplate);

        return response()->json(['success' => true]);
    }

    /**
     * @throws Throwable
     */
    public function update(UpdateBoardTemplateItemRequest $request, BoardTemplateItem $boardTemplateItem): JsonResponse
    {
        $boardTemplateItem = (new BoardTemplateItemUpdateService())->updateBoardTemplateItem($request->validated(), $boardTemplateItem);

        return response()->json(['success' => true, 'data' => $boardTemplateItem]);
    }

    public function destroy(BoardTemplate $boardTemplate, BoardTemplateItem $boardTemplateItem,): JsonResponse
    {
        (new BoardTemplateItemDeleteService())->deleteBoardTemplateItem($boardTemplate, $boardTemplateItem);

        return response()->json(['success' => true]);
    }

    public function reorder(BoardTemplate $boardTemplate, Request $request): JsonResponse
    {
        $items = $request->get('items');
        $items = $items['boardTemplateItems'];

        (new BoardTemplateItemService())->reorderBoardTemplateItems($boardTemplate, $items);

        return response()->json(['success' => true]);
    }
}
