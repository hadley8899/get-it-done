<?php

namespace App\Http\Controllers;

use App\Core\Services\Auth\AuthHelper;
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
use App\Models\KnowledgebaseItem;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Throwable;

class KnowledgebaseController extends Controller
{
    /**
     * @throws WorkspaceException
     */
    public function categories(Workspace $workspace): JsonResponse
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        $knowledgebaseCategories = KnowledgebaseCategory::query()
            ->where('workspace_id', '=', $workspace->id)
            ->where('parent_id', '=', null)
            ->orderBy('position')
            ->get();

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
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }
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
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }
        $children = KnowledgebaseCategory::query()
            ->where('parent_id', '=', $knowledgebaseCategory->id)
            ->get();

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
        $workspaceCategory = new KnowledgebaseCategory();

        $parentUuId = $request->get('parent_uuid');

        if ($parentUuId) {
            $parent = KnowledgebaseCategory::query()
                ->where('uuid', '=', $parentUuId)
                ->firstOrFail();
            $workspaceCategory->parent_id = $parent->id;
        }

        $workspaceCategory->workspace_id = $workspace->id;
        $workspaceCategory->name = $request->get('name');
        $workspaceCategory->description = $request->get('description');

        // Find next available position
        $workspaceCategory->position = KnowledgebaseCategory::query()
                ->where('workspace_id', '=', $workspace->id)
                ->where('parent_id', '=', $workspaceCategory->parent_id)
                ->max('position') + 1;

        $workspaceCategory->saveOrFail();

        return response()->json(new KnowledgebaseCategoryResource($workspaceCategory));
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
        // Make sure this category belongs to this workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            return response()->json(['message' => 'This category does not belong to this workspace'], Response::HTTP_BAD_REQUEST);
        }

        $knowledgebaseCategory->name = $request->get('name');
        $knowledgebaseCategory->description = $request->get('description');
        $knowledgebaseCategory->workspace_id = $workspace->id;

        if ($request->get('position')) {
            $knowledgebaseCategory->position = $request->get('position');
        } else if (empty($knowledgebaseCategory->position)) {
            $knowledgebaseCategory->position = 0;
        }

        $knowledgebaseCategory->saveOrFail();

        // Update positions of other categories
        $categories = KnowledgebaseCategory::query()
            ->where('workspace_id', '=', $workspace->id)
            ->where('parent_id', '=', $knowledgebaseCategory->parent_id)
            ->orderBy('position')
            ->get();

        $position = 0;
        foreach ($categories as $category) {
            $category->position = $position;
            $category->saveOrFail();
            $position++;
        }

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
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure that the knowledgebase belongs to this category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw KnowledgebaseException::knowledgebaseDoesNotBelongToCategory();
        }

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
        $knowledgebase = new Knowledgebase();

        $knowledgebase->category_id = $knowledgebaseCategory->id;
        $knowledgebase->name = $request->get('name');
        $knowledgebase->description = $request->get('description');

        // Find next available position
        $knowledgebase->position = Knowledgebase::query()
                ->where('category_id', '=', $knowledgebaseCategory->id)
                ->max('position') + 1;

        $knowledgebase->saveOrFail();

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
    public function updateKnowledgebase(Workspace $workspace , KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, UpdateKnowledgebaseRequest $request): JsonResponse
    {
        // Make sure this knowledgebase belongs to this category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw KnowledgebaseException::knowledgebaseDoesNotBelongToCategory();
        }

        $knowledgebase->name = $request->get('name');
        $knowledgebase->description = $request->get('description');

        if ($request->get('position')) {
            $knowledgebase->position = $request->get('position');
        } else if (empty($knowledgebase->position)) {
            $knowledgebase->position = 0;
        }

        $knowledgebase->saveOrFail();

        // Update positions of other knowledgebases
        $knowledgebases = Knowledgebase::query()
            ->where('category_id', '=', $knowledgebaseCategory->id)
            ->orderBy('position')
            ->get();

        $position = 0;
        foreach ($knowledgebases as $kb) {
            $kb->position = $position;
            $kb->saveOrFail();
            $position++;
        }

        return response()->json(new KnowledgebaseResource($knowledgebase));
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @return JsonResponse
     * @throws KnowledgebaseException
     */
    public function destroyKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): JsonResponse
    {
        // Make sure user has access to thisd workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure this knowledgebase belongs to this category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw KnowledgebaseException::knowledgebaseDoesNotBelongToCategory();
        }

        // Delete all knowledgebase items
        $knowledgebaseItems = KnowledgebaseItem::query()
            ->where('knowledgebase_id', '=', $knowledgebase->id)
            ->get();

        foreach ($knowledgebaseItems as $knowledgebaseItem) {
            $knowledgebaseItem->delete();
        }

        $knowledgebase->delete();

        return response()->json(['success' => true]);
    }

    public function destroyCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): JsonResponse
    {
        // Make sure user has access to thisd workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Delete all knowledgebases
        $knowledgebases = Knowledgebase::query()
            ->where('category_id', '=', $knowledgebaseCategory->id)
            ->get();

        foreach ($knowledgebases as $knowledgebase) {
            // Delete all the knowledgebase items
            $knowledgebaseItems = KnowledgebaseItem::query()
                ->where('knowledgebase_id', '=', $knowledgebase->id)
                ->get();

            foreach ($knowledgebaseItems as $knowledgebaseItem) {
                $knowledgebaseItem->delete();
            }

            $knowledgebase->delete();
        }

        $knowledgebaseCategory->delete();

        return response()->json(['success' => true]);
    }
}
