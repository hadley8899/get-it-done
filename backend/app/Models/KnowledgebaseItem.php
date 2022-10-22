<?php

namespace App\Models;

use App\Traits\TableUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class KnowledgebaseItem extends Model
{
    use HasFactory, TableUUID, SoftDeletes;

    protected $fillable = [
        'name',
        'contents',
        'knowledgebase_id',
    ];

    /**
     * @return BelongsTo
     */
    public function knowledgebase(): BelongsTo
    {
        return $this->belongsTo(Knowledgebase::class);
    }
}
