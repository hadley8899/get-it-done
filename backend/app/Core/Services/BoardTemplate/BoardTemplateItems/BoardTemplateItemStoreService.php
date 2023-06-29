<?php

namespace App\Core\Services\BoardTemplate\BoardTemplateItems;

use App\Models\BoardTemplate;
use App\Models\BoardTemplateItem;
use Throwable;

class BoardTemplateItemStoreService
{
    /**
     * @throws Throwable
     */
    public function storeBoardTemplateItem(array $requestData, BoardTemplate $boardTemplate): BoardTemplateItem
    {
        $boardTemplateItem = new BoardTemplateItem($requestData);
        $boardTemplateItem->board_template_id = $boardTemplate->id;

        // Find the next available order and populate ->order
        $boardTemplateItem->order = $boardTemplate->boardTemplateItems()->count() + 1;

        $boardTemplateItem->saveOrFail();

        return $boardTemplateItem;
    }
}
