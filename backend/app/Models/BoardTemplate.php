<?php

namespace App\Models;

use App\Traits\TableUUID;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoardTemplate extends Model
{
    use HasFactory, TableUUID;

    protected $fillable = [
        'name',
        'user_id',
        'description',
    ];

    /**
     * @return HasMany
     */
    public function boardTemplateItems(): HasMany
    {
        return $this->hasMany(BoardTemplateItem::class);
    }
}
