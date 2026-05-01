<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['round_id', 'number'])]
class Turn extends Model
{
    /** @use HasFactory<\Database\Factories\TurnFactory> */
    use HasFactory;

    /**
     * Get the round that owns the turn.
     */
    public function round(): BelongsTo
    {
        return $this->belongsTo(Round::class);
    }

    /**
     * Get the scores for the turn.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }
}
