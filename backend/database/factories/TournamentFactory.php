<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tournament>
 */
class TournamentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph,
            'start_time' => now()->addDays(rand(1, 5)),
            'end_time' => now()->addDays(rand(6, 10)),
            'prize_coins' => rand(100, 1000),
            'prize_xp' => rand(200, 2000),
            'min_level' => rand(1, 10),
            'status' => 'active',
        ];
    }
}
