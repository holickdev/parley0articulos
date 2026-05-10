<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['championship_id', 'number', 'name', 'phone', 'payment_type', 'reference', 'status', 'combination_hash'])]
class Entry extends Model
{
    /** @use HasFactory<\Database\Factories\EntryFactory> */
    use HasFactory;

    /**
     * Get the championship that owns the entry.
     */
    public function championship(): BelongsTo
    {
        return $this->belongsTo(Championship::class);
    }

    /**
     * The coleadores that belong to the entry.
     */
    public function coleadores(): BelongsToMany
    {
        return $this->belongsToMany(Coleador::class, 'entry_coleador');
    }
}
