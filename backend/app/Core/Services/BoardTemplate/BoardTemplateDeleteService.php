<?php

namespace App\Core\Services\BoardTemplate;

use App\Models\BoardTemplate;
use Throwable;

class BoardTemplateDeleteService
{
    /**
     * @param BoardTemplate $boardTemplate
     * @return void
     * @throws Throwable
     */
    public function deleteBoardTemplate(BoardTemplate $boardTemplate): void
    {
        // Delete all the items for this template
        $boardTemplate->boardTemplateItems()->get()->each(function ($item) {
            $item->deleteOrFail();
        });

        $boardTemplate->deleteOrFail();
    }
}
