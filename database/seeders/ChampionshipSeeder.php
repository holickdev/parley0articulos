<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use Illuminate\Database\Seeder;

class ChampionshipSeeder extends Seeder
{
    public function run(): void
    {
        $coleadores = Coleador::all();

        $campeonatos = [
            [
                'name' => 'Gran Nacional de Ferias 2026',
                'coleadores_count' => 4,
                'rounds_count' => 6,
                'entry_price' => 500.00,
                'status' => 'in_progress',
            ],
            [
                'name' => 'Copa de Oro - Llanos Orientales',
                'coleadores_count' => 4,
                'rounds_count' => 4,
                'entry_price' => 350.00,
                'status' => 'open',
            ],
            [
                'name' => 'Torneo Clausura Invitacional',
                'coleadores_count' => 5,
                'rounds_count' => 3,
                'entry_price' => 1000.00,
                'status' => 'finished',
            ]
        ];

        foreach ($campeonatos as $data) {
            $championship = Championship::create($data);
            
            // Attach random coleadores to the championship
            // Instead of all, let's attach a reasonable subset or all if that's the intention
            $championship->coleadores()->attach($coleadores->pluck('id'));

            // Create rounds automatically as per controller logic
            for ($i = 1; $i <= $championship->rounds_count; $i++) {
                $championship->rounds()->create(['number' => $i]);
            }
        }
    }
}
