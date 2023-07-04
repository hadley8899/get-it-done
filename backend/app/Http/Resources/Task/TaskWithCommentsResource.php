<?php

namespace App\Http\Resources\Task;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskWithCommentsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'hours_worked' => $this->hours_worked,
            'user' => new UserResource($this->user),
            'board_list' => $this->boardList->uuid,
            'assigned_to' => new UserResource($this->assignedTo),
            'description' => $this->description,
            'position' => $this->position,
            'comments' => TaskCommentResource::collection($this->comments),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
