<?php

namespace App\Core\Services\BoardTemplate;

use App\Models\BoardTemplate;
use Throwable;

class BoardTemplateUpdateService
{
    /**
     * @throws Throwable
     */
    public function updateBoardTemplate(array $requestData, BoardTemplate $boardTemplate): BoardTemplate
    {
        $boardTemplate->updateOrFail($requestData);

        return $boardTemplate;
    }
}
