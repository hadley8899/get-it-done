<?php

namespace App\Http\Controllers;

use App\Core\Services\BoardTemplate\BoardTemplateDeleteService;
use App\Core\Services\BoardTemplate\BoardTemplateStoreService;
use App\Core\Services\BoardTemplate\BoardTemplateService;
use App\Core\Services\BoardTemplate\BoardTemplateUpdateService;
use App\Http\Requests\BoardTemplate\StoreBoardTemplateRequest;
use App\Http\Requests\BoardTemplate\UpdateBoardTemplateRequest;
use App\Http\Resources\BoardTemplate\BoardTemplateCollection;
use App\Http\Resources\BoardTemplate\BoardTemplateResource;
use App\Models\BoardTemplate;
use Illuminate\Http\JsonResponse;
use Throwable;

class BoardTemplateController extends Controller
{
    public function index(): BoardTemplateCollection
    {
        return BoardTemplateService::allForUser(auth()->id());
    }

    public function show(BoardTemplate $boardTemplate): BoardTemplateResource
    {
        return BoardTemplateService::showBoardTemplate($boardTemplate);
    }

    /**
     * @throws Throwable
     */
    public function store(StoreBoardTemplateRequest $request): JsonResponse
    {
        $requestData = $request->validated();
        $requestData['user_id'] = auth()->id();

        (new BoardTemplateStoreService())->addBoardTemplate($requestData);

        return response()->json(['success' => true]);
    }

    /**
     * @throws Throwable
     */
    public function update(UpdateBoardTemplateRequest $request, BoardTemplate $boardTemplate): JsonResponse
    {
        $boardTemplate = (new BoardTemplateUpdateService())->updateBoardTemplate($request->validated(), $boardTemplate);

        return response()->json(['success' => true, 'data' => $boardTemplate]);
    }

    /**
     * @throws Throwable
     */
    public function destroy(BoardTemplate $boardTemplate): JsonResponse
    {
        (new BoardTemplateDeleteService())->deleteBoardTemplate($boardTemplate);

        return response()->json(['success' => true]);
    }
}
