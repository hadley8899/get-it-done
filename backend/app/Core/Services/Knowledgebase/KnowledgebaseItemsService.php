<?php

namespace App\Core\Services\Knowledgebase;

use App\Core\Services\Auth\AuthHelper;
use App\Core\Services\Workspace\WorkspacePermissionService;
use App\Exceptions\WorkspaceException;
use App\Models\Knowledgebase;
use App\Models\KnowledgebaseCategory;
use App\Models\KnowledgebaseItem;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Throwable;

class KnowledgebaseItemsService
{
    /**
     * @throws WorkspaceException
     */
    public function fetchItemsForKnowledgebase(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase): Collection
    {
        $this->checkWorkspaceAccess($workspace, $knowledgebaseCategory, $knowledgebase);

        // Get all the knowledgebase items
        return $knowledgebase
            ->knowledgebaseItems()
            ->orderBy('position')
            ->get();
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param KnowledgebaseItem $knowledgebaseItem
     * @return KnowledgebaseItem
     * @throws WorkspaceException
     */
    public function fetchKnowledgebaseItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem)
    {
        // Make sure the knowledgebase item belongs to the knowledgebase
        if ($knowledgebaseItem->knowledgebase_id !== $knowledgebase->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        return $knowledgebaseItem;
    }

    /**
     * @throws Throwable
     * @throws WorkspaceException
     */
    public function storeKnowledgebaseItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, Request $request): KnowledgebaseItem
    {
        $this->checkWorkspaceAccess($workspace, $knowledgebaseCategory, $knowledgebase);

        // Create the knowledgebase item
        $knowledgebaseItem = new KnowledgebaseItem($request->validated());
        $knowledgebaseItem->knowledgebase_id = $knowledgebase->id;

        // Find the next available position
        $knowledgebaseItem->position = KnowledgebaseItem::query()
                ->where('knowledgebase_id', $knowledgebase->id)
                ->max('position') + 1;

        $knowledgebaseItem->saveOrFail();

        return $knowledgebaseItem;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param KnowledgebaseItem $knowledgebaseItem
     * @param Request $request
     * @return KnowledgebaseItem
     * @throws WorkspaceException
     */
    public function updateKnowledgebaseItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem, Request $request): KnowledgebaseItem
    {
        $this->checkWorkspaceAccess($workspace, $knowledgebaseCategory, $knowledgebase);

        // Update the knowledgebase item
        $knowledgebaseItem->update($request->validated());

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

        return $knowledgebaseItem;
    }

    /**
     * @param Workspace $workspace
     * @param KnowledgebaseCategory $knowledgebaseCategory
     * @param Knowledgebase $knowledgebase
     * @param KnowledgebaseItem $knowledgebaseItem
     * @return void
     * @throws WorkspaceException
     */
    public function deleteKnowledgebaseItem(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory, Knowledgebase $knowledgebase, KnowledgebaseItem $knowledgebaseItem): void
    {
        $this->checkWorkspaceAccess($workspace, $knowledgebaseCategory, $knowledgebase);

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
    }

    /**
     * @throws WorkspaceException
     */
    private function checkWorkspaceAccess(Workspace $workspace, KnowledgebaseCategory $knowledgebaseCategory = null, Knowledgebase $knowledgebase = null): void
    {
        // Make sure the user has access to the workspace
        if (!WorkspacePermissionService::userHasAccessToWorkspace(AuthHelper::getLoggedInUser(), $workspace)) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledgebase category belongs to the workspace
        if ($knowledgebaseCategory !== null && $knowledgebaseCategory->workspace_id !== $workspace->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }

        // Make sure the knowledge base belongs to the category
        if ($knowledgebase && $knowledgebase->category_id !== $knowledgebaseCategory->id) {
            throw WorkspaceException::noAccessToWorkspace();
        }
    }
}
