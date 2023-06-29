<?php

namespace App\Core\Services\BoardTemplate\BoardTemplateItems;

use App\Models\BoardTemplate;
use App\Models\BoardTemplateItem;

class BoardTemplateItemDeleteService
{
    public function deleteBoardTemplateItem(BoardTemplate $boardTemplate, BoardTemplateItem $boardTemplateItem): void
    {
        // Delete the board template item, Then re-order the remaining items
        $boardTemplateItem->delete();

        $boardTemplate->boardTemplateItems()->orderBy('order')->get()->each(function ($item, $index) {
            $item->order = $index + 1;
            $item->save();
        });
    }
}
