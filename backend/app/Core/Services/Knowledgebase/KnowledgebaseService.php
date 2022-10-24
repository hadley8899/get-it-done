<?php

namespace App\Core\Services\Knowledgebase;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\KnowledgebaseException;
use App\Exceptions\WorkspaceException;
use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\KnowledgebaseItem;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Throwable;

class KnowledgebaseService
{
    /**
     * @throws WorkspaceException
     */
    public function fetchKnowledgebaseCategories(Workspace $workspace): Collection
    {
        $this->checkWorkspaceAccess($workspace);

        return KnowledgebaseCategory::query()
            ->where('workspace_id', '=', $workspace->id)
            ->where('parent_id', '=', null)
            ->orderBy('position')
            ->get();
    }

    /**
     * @throws WorkspaceException
     */
    public function fetchKnowledgebaseCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): KnowledgebaseCategory
    {
        $this->checkWorkspaceAccess($workspace);
        return $knowledgebaseCategory;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return Collection
     * @throws WorkspaceException
     */
    public function fetchKnowledgebaseCategoryChildren(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): Collection
    {
        $this->checkWorkspaceAccess($workspace);
        return KnowledgebaseCategory::query()
            ->where('parent_id', '=', $knowledgebaseCategory->id)
            ->get();
    }

    /**
     * @param Workspace $workspace
     * @param Request $request
     * @return KnowledgebaseCategory
     * @throws Throwable
     */
    public function storeCategory(Workspace $workspace, Request $request)
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

        return $workspaceCategory;
    }

    /**
     * @param Workspace $workspace
     * @param Request $request
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return KnowledgebaseCategory
     * @throws Throwable
     */
    public function updateCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Request $request): KnowledgebaseCategory
    {
        // Make sure this category belongs to this workspace
        if ($knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw KnowledgebaseException::knowledgebaseDoesNotBelongToWorkspace();
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

        return $knowledgebaseCategory;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @return Knowledgebase
     * @throws KnowledgebaseException
     * @throws WorkspaceException
     */
    public function fetchKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): Knowledgebase
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure that the knowledgebase belongs to this category
        if ($knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw KnowledgebaseException::knowledgebaseDoesNotBelongToCategory();
        }

        return $knowledgebase;
    }

    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function storeKnowledgebase(Workspace $workspace, $knowledgebaseCategory, Request $request): Knowledgebase
    {
        $this->checkWorkspaceAccess($workspace);
        $knowledgebase = new Knowledgebase();

        $knowledgebase->category_id = $knowledgebaseCategory->id;
        $knowledgebase->name = $request->get('name');
        $knowledgebase->description = $request->get('description');

        // Find next available position
        $knowledgebase->position = Knowledgebase::query()
                ->where('category_id', '=', $knowledgebaseCategory->id)
                ->max('position') + 1;

        $knowledgebase->saveOrFail();

        return $knowledgebase;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param Request $request
     * @return Knowledgebase
     * @throws KnowledgebaseException
     * @throws Throwable
     */
    public function updateKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, Request $request): Knowledgebase
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

        return $knowledgebase;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @return void
     * @throws KnowledgebaseException
     * @throws WorkspaceException
     */
    public function deleteKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): void
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
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @return void
     * @throws WorkspaceException
     */
    public function deleteCategory(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory): void
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
    }

    /**
     * @throws WorkspaceException
     */
    private function checkWorkspaceAccess(Workspace $workspace): void
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }
    }
}
