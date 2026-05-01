<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['turn_id', 'coleador_id', 'effective_coleadas', 'null_coleadas', 'gate_bulls', 'articles'])]
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
            'articles' => 'integer',
        ];
    }

    /**
     * Get the turn that owns the score.
     */
    public function turn(): BelongsTo
    {
        return $this->belongsTo(Turn::class);
    }

    /**
     * Get the coleador that owns the score.
     */
    public function coleador(): BelongsTo
    {
        return $this->belongsTo(Coleador::class);
    }
}
