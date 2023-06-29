<?php

namespace App\Core\Services\BoardTemplate\BoardTemplateItems;

use App\Http\Resources\BoardTemplate\BoardTemplateItem\BoardTemplateItemCollection;
use App\Http\Resources\BoardTemplate\BoardTemplateItem\BoardTemplateItemResource;
use App\Models\BoardTemplate;
use App\Models\BoardTemplateItem;

class BoardTemplateItemService
{
    public function allForBoardTemplate(BoardTemplate $boardTemplate): BoardTemplateItemCollection
    {
        $items = $boardTemplate->boardTemplateItems()->orderBy('order')->get();

        return new BoardTemplateItemCollection(BoardTemplateItemResource::collection($items));
    }

    public function viewBoardTemplateItem(BoardTemplateItem $boardTemplateItem): BoardTemplateItemResource
    {
        return new BoardTemplateItemResource($boardTemplateItem);
    }

    public function reorderBoardTemplateItems(BoardTemplate $boardTemplate, array $items): BoardTemplate
    {
        foreach ($items as $k => $item) {
            $boardTemplateItem = BoardTemplateItem::query()->where('uuid', '=', $item)->first();

            if (!$boardTemplateItem) {
                continue;
            }

            if ($boardTemplateItem->board_template_id !== $boardTemplate->id) {
                continue;
            }

            $boardTemplateItem->order = ($k + 1);
            // Don't update the timestamps on a reorder
            $boardTemplateItem->timestamps = false;
            $boardTemplateItem->update();
        }

        return $boardTemplate;
    }
}
