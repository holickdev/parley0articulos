<?php

namespace Database\Factories;

use App\Models\Coleador;
use App\Models\Round;
use App\Models\Score;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Score>
 */
class ScoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'round_id' => Round::factory(),
            'coleador_id' => Coleador::factory(),
            'effective_coleadas' => fake()->numberBetween(0, 5),
            'null_coleadas' => fake()->numberBetween(0, 2),
            'gate_bulls' => fake()->numberBetween(0, 1),
        ];
    }
}
