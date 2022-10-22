<?php

namespace App\Http\Resources\Knowledgebase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KnowledgebaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'uuid' => $this->uuid,
            'knowledgebase_category' => $this->knowledgebaseCategory ? new KnowledgebaseCategoryResource($this->knowledgebaseCategory) : null,
            'name' => $this->name,
            'description' => $this->description,
            'position' => $this->position,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'item_count' => $this->knowledgebaseItems()->count(),
        ];
    }
}
