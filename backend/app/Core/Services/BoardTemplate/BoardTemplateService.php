<?php

namespace App\Core\Services\BoardTemplate;

use App\Http\Resources\BoardTemplate\BoardTemplateCollection;
use App\Http\Resources\BoardTemplate\BoardTemplateResource;
use App\Models\BoardTemplate;

class BoardTemplateService
{
    /**
     * @param $userId
     * @return BoardTemplateCollection
     */
    public static function allForUser($userId): BoardTemplateCollection
    {
        $allForUser = BoardTemplate::query()->where('user_id', $userId)->get();

        return new BoardTemplateCollection(BoardTemplateResource::collection($allForUser));
    }

    /**
     * @param BoardTemplate $boardTemplate
     * @return BoardTemplateResource
     */
    public static function showBoardTemplate(BoardTemplate $boardTemplate): BoardTemplateResource
    {
        return new BoardTemplateResource($boardTemplate);
    }
}
