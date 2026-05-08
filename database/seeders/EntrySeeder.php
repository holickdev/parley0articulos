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
            $count = $championship->status === 'finished' ? 5 : 12;
            
            $participants = $championship->coleadores;
            
            if ($participants->count() < $championship->coleadores_count) {
                // Not enough participants in the championship to form a valid entry based on coleadores_count
                continue;
            }

            for ($i = 1; $i <= $count; $i++) {
                // Select exactly the required number of coleadores from those associated with this championship
                $selectedIds = $participants->random($championship->coleadores_count)->pluck('id')->toArray();
                sort($selectedIds);
                $hash = implode('-', $selectedIds);

                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'name' => 'Cuadro ' . $i,
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
