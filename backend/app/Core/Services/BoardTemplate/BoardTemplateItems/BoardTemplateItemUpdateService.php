<?php

namespace App\Core\Services\BoardTemplate\BoardTemplateItems;

use App\Models\BoardTemplateItem;
use Throwable;

class BoardTemplateItemUpdateService
{
    /**
     * @throws Throwable
     */
    public function updateBoardTemplateItem(array $requestData, BoardTemplateItem $boardTemplateItem): BoardTemplateItem
    {
        $boardTemplateItem->updateOrFail($requestData);
        return $boardTemplateItem;
    }
}
