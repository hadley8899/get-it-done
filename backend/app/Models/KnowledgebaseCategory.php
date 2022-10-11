<?php

namespace App\Models;

use App\Traits\TableUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class KnowledgebaseCategory extends Model
{
    use HasFactory, TableUUID, SoftDeletes;

    /**
     * @return HasMany
     */
    public function knowledgebases(): HasMany
    {
        return $this->hasMany(Knowledgebase::class, 'category_id');
    }

    /**
     * @return BelongsTo
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'parent_id');
    }
}
