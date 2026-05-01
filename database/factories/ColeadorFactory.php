<?php

namespace Database\Factories;

use App\Models\Coleador;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coleador>
 */
class ColeadorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
        ];
    }
}
