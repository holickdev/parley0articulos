<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['identification', 'bank', 'phone', 'reference', 'amount_bs', 'payment_date'])]
class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_bs' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    /**
     * Get the entry associated with the payment.
     */
    public function entry(): HasOne
    {
        return $this->hasOne(Entry::class);
    }
}
