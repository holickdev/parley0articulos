<?php

namespace Database\Seeders;

use App\Models\Championship;
use App\Models\Coleador;
use App\Models\Customer;
use App\Models\Entry;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class EntrySeeder extends Seeder
{
    public function run(): void
    {
        $championships = Championship::all();
        $coleadores = Coleador::all();

        foreach ($championships as $championship) {
            $count = $championship->status === 'finished' ? 5 : 15;

            for ($i = 1; $i <= $count; $i++) {
                $cedula = 'V-' . (20000000 + $championship->id * 100 + $i);

                $customer = Customer::create([
                    'identification' => $cedula,
                    'name' => 'Cliente ' . $championship->id . '-' . $i,
                    'phone' => '0414' . rand(1000000, 9999999),
                ]);

                $payment = Payment::create([
                    'identification' => $cedula,
                    'bank' => 'Banesco',
                    'phone' => $customer->phone,
                    'reference' => 'REF-' . $championship->id . '-' . $i . '-' . rand(100, 999),
                    'amount_bs' => $championship->entry_price,
                    'payment_date' => now(),
                ]);

                $selectedIds = $coleadores->random($championship->coleadores_count)->pluck('id')->toArray();
                sort($selectedIds);
                $hash = implode('-', $selectedIds);

                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'customer_id' => $customer->id,
                    'payment_id' => $payment->id,
                    'name' => 'Cuadro ' . $i . ' - ' . $customer->name,
                    'status' => $championship->status === 'finished' ? 'approved' : (rand(0, 10) > 2 ? 'approved' : 'pending'),
                    'combination_hash' => $hash,
                ]);

                $entry->coleadores()->attach($selectedIds);
            }
        }
    }
}
