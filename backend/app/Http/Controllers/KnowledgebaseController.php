<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Knowledgebase\KnowledgebaseService;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\KnowledgebaseException;
use App\Exceptions\WorkspaceException;
use App\Http\Requests\KnowledgeBase\AddKnowledgebaseCategoryRequest;
use App\Http\Requests\KnowledgeBase\AddKnowledgebaseRequest;
use App\Http\Requests\KnowledgeBase\UpdateKnowledgebaseCategoryRequest;
use App\Http\Requests\KnowledgeBase\UpdateKnowledgebaseRequest;
use App\Http\Resources\Knowledgebase\KnowledgebaseCategoryCollection;
use App\Http\Resources\Knowledgebase\KnowledgebaseCategoryResource;
use App\Http\Resources\Knowledgebase\KnowledgebaseCollection;
use App\Http\Resources\Knowledgebase\KnowledgebaseResource;
use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Throwable;

class KnowledgebaseController extends Controller
{
    /**
     * @throws WorkspaceException
     */
    public function categories(Workspace $workspace): JsonResponse
    {
        $knowledgebaseCategories = (new KnowledgebaseService())->fetchKnowledgebaseCategories($workspace);
        return response()->json(new KnowledgebaseCategoryCollection(KnowledgebaseCategoryResource::collection($knowledgebaseCategories)));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function category(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): JsonResponse
    {
        $knowledgebaseCategory = (new KnowledgebaseService())->fetchKnowledgebaseCategory($workspace, $knowledgebaseCategory);
        return response()->json(new KnowledgebaseCategoryResource($knowledgebaseCategory));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function categoryChildren(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): JsonResponse
    {
        $children = (new KnowledgebaseService())->fetchKnowledgebaseCategoryChildren($workspace, $knowledgebaseCategory);
        return response()->json(new KnowledgebaseCategoryCollection(KnowledgebaseCategoryResource::collection($children)));
    }

    /**
     * @param Workspace $workspace
     * @param AddKnowledgebaseCategoryRequest $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function storeCategory(Workspace $workspace, AddKnowledgebaseCategoryRequest $request): JsonResponse
    {
        $knowledgebaseCategory = (new KnowledgebaseService())->storeCategory($workspace, $request);
        return response()->json(new KnowledgebaseCategoryResource($knowledgebaseCategory));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param UpdateKnowledgebaseCategoryRequest $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function updateCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, UpdateKnowledgebaseCategoryRequest $request): JsonResponse
    {
        $knowledgebaseCategory = (new KnowledgebaseService())->updateCategory($workspace, $knowledgebaseCategory, $request);
        return response()->json(new KnowledgebaseCategoryResource($knowledgebaseCategory));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return JsonResponse
     * @throws WorkspaceException
     */
    public function knowledgebases(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): JsonResponse
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        $knowledgebases = Knowledgebase::query()
            ->where('category_id', '=', $knowledgebaseCategory->id)
            ->with('knowledgebaseItems')
            ->get();

        return response()->json(new KnowledgebaseCollection(KnowledgebaseResource::collection($knowledgebases)));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @return JsonResponse
     * @throws KnowledgebaseException
     * @throws WorkspaceException
     */
    public function knowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): JsonResponse
    {
        $knowledgebase = (new KnowledgebaseService())->fetchKnowledgebase($workspace, $knowledgebaseCategory, $knowledgebase);
        return response()->json(new KnowledgebaseResource($knowledgebase));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param AddKnowledgebaseRequest $request
     * @return JsonResponse
     * @throws Throwable
     */
    public function storeKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, AddKnowledgebaseRequest $request): JsonResponse
    {
        $knowledgebase = (new KnowledgebaseService())->storeKnowledgebase($workspace, $knowledgebaseCategory, $request);
        return response()->json(new KnowledgebaseResource($knowledgebase));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param UpdateKnowledgebaseRequest $request
     * @return JsonResponse
     * @throws KnowledgebaseException
     * @throws Throwable
     */
    public function updateKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, UpdateKnowledgebaseRequest $request): JsonResponse
    {
        $knowledgebase = (new KnowledgebaseService())->updateKnowledgebase($workspace, $knowledgebaseCategory, $knowledgebase, $request);

        return response()->json(new KnowledgebaseResource($knowledgebase));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @return JsonResponse
     * @throws KnowledgebaseException
     * @throws WorkspaceException
     */
    public function destroyKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): JsonResponse
    {
        (new KnowledgebaseService())->deleteKnowledgebase($workspace, $knowledgebaseCategory, $knowledgebase);

        return response()->json(['success' => true]);
    }

    /**
     * @throws WorkspaceException
     */
    public function destroyCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): JsonResponse
    {
        (new KnowledgebaseService())->deleteCategory($workspace, $knowledgebaseCategory);

        return response()->json(['success' => true]);
    }
}
