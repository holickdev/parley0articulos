<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Round;
use App\Models\Score;
use App\Models\Turn;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $championships = Championship::whereIn('status', ['in_progress', 'finished'])->get();
        $coleadores = Coleador::all();

        foreach ($championships as $championship) {
            $numRondas = $championship->status === 'finished' ? 3 : 2;
            
            for ($r = 1; $r <= $numRondas; $r++) {
                $round = Round::create([
                    'championship_id' => $championship->id,
                    'number' => $r
                ]);

                for ($t = 1; $t <= 2; $t++) {
                    $turn = Turn::create([
                        'round_id' => $round->id,
                        'number' => $t
                    ]);

                    // Puntuar a 12 coleadores aleatorios por turno
                    foreach ($coleadores->random(12) as $coleador) {
                        Score::create([
                            'turn_id' => $turn->id,
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
}
