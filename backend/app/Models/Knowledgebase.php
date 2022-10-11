<?php

namespace App\Models;

use App\Traits\TableUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Knowledgebase extends Model
{
    use HasFactory, TableUUID, SoftDeletes;

    protected $fillable = [
        'name',
        'parent_id',
        'position',
        'workspace_id',
        'category_id',
        'user_id',
    ];

    /**
     * @return HasMany
     */
    public function knowledgebaseItems(): HasMany
    {
        return $this->hasMany(KnowledgebaseItem::class);
    }

    /**
     * @return BelongsTo
     */
    public function knowledgebaseCategory(): BelongsTo
    {
        return $this->belongsTo(KnowledgebaseCategory::class, 'category_id');
    }
}
