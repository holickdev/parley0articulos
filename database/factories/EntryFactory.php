<?php

namespace Database\Factories;

use App\Models\Championship;
use App\Models\Entry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Entry>
 */
class EntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'championship_id' => Championship::factory(),
            'number' => 1,
            'name' => 'Cuadro ' . fake()->words(2, true),
            'phone' => fake()->phoneNumber(),
            'payment_type' => fake()->randomElement(['pago movil', 'zelle', 'usdt']),
            'reference' => fake()->numerify('######'),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'combination_hash' => fake()->unique()->sha256(),
        ];
    }
}
