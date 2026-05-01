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
                'entry_price' => 500.00,
                'status' => 'in_progress',
            ],
            [
                'name' => 'Copa de Oro - Llanos Orientales',
                'coleadores_count' => 4,
                'entry_price' => 350.00,
                'status' => 'open',
            ],
            [
                'name' => 'Torneo Clausura Invitacional',
                'coleadores_count' => 5,
                'entry_price' => 1000.00,
                'status' => 'finished',
            ]
        ];

        foreach ($campeonatos as $data) {
            $championship = Championship::create($data);
            $championship->coleadores()->attach($coleadores->pluck('id'));
        }
    }
}
