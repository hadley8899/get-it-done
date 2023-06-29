<?php

namespace App\Models;

use App\Traits\TableUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BoardTemplateItem extends Model
{
    use HasFactory, TableUUID;

    protected $fillable = [
        'name',
        'description',
        'board_template_id',
        'order',
    ];

    public function boardTemplate(): BelongsTo
    {
        return $this->belongsTo(BoardTemplate::class);
    }
}
