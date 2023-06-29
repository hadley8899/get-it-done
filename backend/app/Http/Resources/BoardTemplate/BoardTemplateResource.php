<?php

namespace App\Http\Resources\BoardTemplate;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BoardTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        // Get the names of each item and put them into a string
        $items = $this->boardTemplateItems->map(function ($item) {
            return $item->name;
        })->implode(', ');

        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'items' => $items,
            'description' => $this->description,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
