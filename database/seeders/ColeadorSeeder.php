<?php

namespace Database\Seeders;

use App\Models\Coleador;
use Illuminate\Database\Seeder;

class ColeadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 100 coleadores si no hay suficientes
        if (Coleador::count() < 100) {
            Coleador::factory()->count(100)->create();
        }
    }
}
