<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Entry;
use Illuminate\Database\Seeder;

class EntrySeeder extends Seeder
{
    public function run(): void
    {
        $championships = Championship::with('coleadores')->get();

        foreach ($championships as $championship) {
            // Determine number of entries to seed based on status
            $count = $championship->status === 'finished' ? 10 : 25;

            $participants = $championship->coleadores;

            if ($participants->count() < $championship->coleadores_count) {
                continue;
            }

            for ($i = 1; $i <= $count; $i++) {
                // Select exactly the required number of coleadores
                $selectedIds = $participants->random($championship->coleadores_count)->pluck('id')->toArray();
                sort($selectedIds);
                $hash = implode('-', $selectedIds);

                // Evitar duplicados de hash en el seeder si el azar repite combinación
                $exists = Entry::where('championship_id', $championship->id)
                    ->where('combination_hash', $hash)
                    ->exists();

                if ($exists) {
                    $i--; // Intentar de nuevo
                    continue;
                }

                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'number' => $i, // Asignamos el correlativo
                    'name' => 'Cuadro ' . fake()->words(2, true),
                    'phone' => '0414' . rand(1000000, 9999999),
                    'payment_type' => ['pago movil', 'zelle', 'usdt'][rand(0, 2)],
                    'reference' => 'REF-' . $championship->id . '-' . $i . '-' . rand(1000, 9999),
                    'status' => $championship->status === 'finished' ? 'approved' : (rand(0, 10) > 2 ? 'approved' : 'pending'),
                    'combination_hash' => $hash,
                ]);

                $entry->coleadores()->attach($selectedIds);
            }
        }
    }
}
