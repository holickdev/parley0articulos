<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    protected $fillable = ['score_id', 'name', 'points'];

    public function score(): BelongsTo
    {
        return $this->belongsTo(Score::class);
    }
}
