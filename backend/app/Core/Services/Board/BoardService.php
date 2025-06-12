<?php

namespace App\Core\Services\Board;

use App\Models\Board;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

abstract class BoardService
{
    /**
     * @param Board $board
     * @param UploadedFile|null $image
     * @return Board
     */
    protected function addImageToBoardIfExists(Board $board, UploadedFile $image = null): Board
    {
        if ($image !== null) {
            $filename = time() . '_' . $image->getClientOriginalName();
            $fullFilePath = Storage::disk('public')->path("board-images/$filename");
            $databasePath = "storage/board-images/{$filename}";

            // Make sure the folder exists
            Storage::disk('public')->makeDirectory('board-images');

            Image::read($image)
                ->cover(200, 200)          // keep aspect-ratio, crop if needed
                ->save($fullFilePath);

            $board->image = $databasePath;
        } else {
            $board->image = 'img/default-board-image.png';
        }

        return $board;
    }
}
