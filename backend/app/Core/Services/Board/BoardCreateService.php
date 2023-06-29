<?php

namespace App\Core\Services\Board;

use App\Core\Services\Auth\AuthHelper;
use App\Exceptions\BoardException;
use App\Models\Board;
use App\Models\BoardTemplate;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Throwable;

class BoardCreateService extends BoardService
{
    /**
     * @param array $requestData
     * @param Workspace $workspace
     * @param UploadedFile|null $image
     * @param string|null $boardTemplateUuId
     * @return Board
     * @throws BoardException
     * @throws Throwable
     */
    public function createBoard(array $requestData, Workspace $workspace, UploadedFile $image = null, $boardTemplateUuId = null): Board
    {
        $requestData['workspace_id'] = $workspace->id;
        $requestData['user_id'] = AuthHelper::getLoggedInUser()->id;

        $board = new Board($requestData);

        // Check if there is already a board with the same name
        $existingBoard = Board::query()->where('workspace_id', '=', $workspace->id)->where('name', '=', $board->name)->first();

        if ($existingBoard) {
            throw BoardException::boardSameName();
        }

        $this->addImageToBoardIfExists($board, $image);

        $board->saveOrFail();

        $boardTemplate = BoardTemplate::query()->where('uuid', '=', $boardTemplateUuId)->first();

        if ($boardTemplate !== null) {
            $this->addBoardListsFromTemplate($board, $boardTemplate);
        }

        return $board;
    }

    private function addBoardListsFromTemplate(Board $board, BoardTemplate $boardTemplate): void
    {
        $boardTemplateItems = $boardTemplate->boardTemplateItems()->orderBy('order')->get();

        if (count($boardTemplateItems) === 0) {
            return;
        }

        foreach ($boardTemplateItems as $boardTemplateItem) {
            $board->boardLists()->create([
                'name' => $boardTemplateItem->name,
                'position' => $boardTemplateItem->order,
            ]);
        }
    }
}
