<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Score;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        // Only seed scores for championships that are in progress or finished
        $championships = Championship::whereIn('status', ['in_progress', 'finished'])
            ->with(['rounds', 'coleadores'])
            ->get();

        foreach ($championships as $championship) {
            // Determine how many rounds should have scores based on status
            $roundsToSeed = $championship->status === 'finished' 
                ? $championship->rounds 
                : $championship->rounds->take(2); // Seed first 2 rounds if in progress

            foreach ($roundsToSeed as $round) {
                // Score some random coleadores from the championship's participants
                $participants = $championship->coleadores;
                
                if ($participants->isEmpty()) continue;

                // Pick about 70% of participants to have scores in this round
                $numToScore = ceil($participants->count() * 0.7);
                $toScore = $participants->random(min($numToScore, $participants->count()));

                foreach ($toScore as $coleador) {
                    Score::create([
                        'round_id' => $round->id,
                        'coleador_id' => $coleador->id,
                        'effective_coleadas' => rand(0, 3),
                        'null_coleadas' => rand(0, 1),
                        'gate_bulls' => rand(0, 2),
                        'articles' => rand(0, 1) > 0.8 ? 1 : 0,
                    ]);
                }
            }
        }
    }
}
