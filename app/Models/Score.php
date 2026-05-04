<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['round_id', 'coleador_id', 'effective_coleadas', 'null_coleadas', 'gate_bulls', 'articles'])]
class Score extends Model
{
    /** @use HasFactory<\Database\Factories\ScoreFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'effective_coleadas' => 'integer',
            'null_coleadas' => 'integer',
            'gate_bulls' => 'integer',
            'articles' => 'array',
        ];
    }

    /**
     * Get the round that owns the score.
     */
    public function round(): BelongsTo
    {
        return $this->belongsTo(Round::class);
    }

    /**
     * Get the coleador that owns the score.
     */
    public function coleador(): BelongsTo
    {
        return $this->belongsTo(Coleador::class);
    }
}
