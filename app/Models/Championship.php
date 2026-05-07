<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'coleadores_count', 'rounds_count', 'entry_price', 'status', 'has_articles'])]
class Championship extends Model
{
    /** @use HasFactory<\Database\Factories\ChampionshipFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'entry_price' => 'decimal:2',
            'coleadores_count' => 'integer',
            'rounds_count' => 'integer',
            'has_articles' => 'boolean',
        ];
    }

    /**
     * The coleadores that belong to the championship.
     */
    public function coleadores(): BelongsToMany
    {
        return $this->belongsToMany(Coleador::class, 'championship_coleador');
    }

    /**
     * Get the entries for the championship.
     */
    public function entries(): HasMany
    {
        return $this->hasMany(Entry::class);
    }

    /**
     * Get the rounds for the championship.
     */
    public function rounds(): HasMany
    {
        return $this->hasMany(Round::class);
    }
}
