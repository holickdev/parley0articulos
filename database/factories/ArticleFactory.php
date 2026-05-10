<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Score;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'score_id' => Score::factory(),
            'name' => fake()->randomElement(['5B', '10C', 'Art 15', 'Penalización']),
            'points' => fake()->randomElement([5, 10, 15]),
        ];
    }
}
