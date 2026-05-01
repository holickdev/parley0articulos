<?php

namespace Database\Seeders;

use App\Models\Coleador;
use Illuminate\Database\Seeder;

class ColeadorSeeder extends Seeder
{
    public function run(): void
    {
        Coleador::factory(100)->create();
    }
}
