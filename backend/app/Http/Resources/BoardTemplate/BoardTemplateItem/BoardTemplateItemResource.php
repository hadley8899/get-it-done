<?php

namespace App\Http\Resources\BoardTemplate\BoardTemplateItem;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BoardTemplateItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'uuid' => $this->uuid,
            'board_template_uuid' => $this->boardTemplate->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'order' => $this->order,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
