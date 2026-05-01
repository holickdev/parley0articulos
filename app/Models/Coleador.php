<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Coleador extends Model
{
    /** @use HasFactory<\Database\Factories\ColeadorFactory> */
    use HasFactory;

    protected $table = 'coleadores';

    /**
     * The championships that the coleador participates in.
     */
    public function championships(): BelongsToMany
    {
        return $this->belongsToMany(Championship::class, 'championship_coleador');
    }

    /**
     * The entries that selected this coleador.
     */
    public function entries(): BelongsToMany
    {
        return $this->belongsToMany(Entry::class, 'entry_coleador');
    }

    /**
     * Get the scores for the coleador.
     */
    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }
}
