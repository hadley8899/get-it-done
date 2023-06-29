<?php

namespace App\Core\Services\BoardTemplate;

use App\Models\BoardTemplate;
use Throwable;

class BoardTemplateStoreService
{
    /**
     * @param array $requestData
     * @return BoardTemplate
     * @throws Throwable
     */
    public function addBoardTemplate(array $requestData): BoardTemplate
    {
        $boardTemplate = new BoardTemplate($requestData);

        $boardTemplate->saveOrFail();

        return $boardTemplate;
    }
}
