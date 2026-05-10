<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Score;
use App\Models\Article;
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
                : $championship->rounds->take(2);

            // Get all coleadores that are actually participating in entries
            $participatingColeadorIds = \DB::table('entry_coleador')
                ->join('entries', 'entry_coleador.entry_id', '=', 'entries.id')
                ->where('entries.championship_id', $championship->id)
                ->distinct()
                ->pluck('coleador_id');

            foreach ($roundsToSeed as $round) {
                foreach ($participatingColeadorIds as $coleadorId) {
                    // Create or Update score to avoid unique constraint issues
                    $score = Score::updateOrCreate(
                        [
                            'round_id' => $round->id,
                            'coleador_id' => $coleadorId,
                        ],
                        [
                            'effective_coleadas' => rand(0, 4),
                            'null_coleadas' => rand(0, 2),
                            'gate_bulls' => rand(0, 1),
                        ]
                    );

                    // Randomly add articles (20% chance)
                    if (rand(1, 100) <= 20) {
                        // Delete existing articles for this score if re-running
                        $score->articles()->delete();
                        
                        Article::create([
                            'score_id' => $score->id,
                            'name' => ['5B', '10C', 'Art 15'][rand(0, 2)],
                            'points' => [5, 10, 15][rand(0, 2)],
                        ]);
                    }
                }
            }
        }
    }
}
