<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Entry;
use App\Models\Coleador;
use App\Models\Score;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke()
    {
        // 1. Estatus de Cuadros (Dona)
        $entriesData = Entry::select('status', DB::raw('count(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $labels = [
                    'approved' => 'Aprobados',
                    'pending' => 'Pendientes',
                    'rejected' => 'Rechazados'
                ];
                return [
                    'name' => $labels[$item->status] ?? $item->status,
                    'value' => $item->value,
                    'status' => $item->status
                ];
            });

        // 2. Estatus de Campeonatos (Pie Sólido)
        $championshipsData = Championship::select('status', DB::raw('count(*) as value'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $labels = [
                    'open' => 'Abiertos',
                    'in_progress' => 'En Progreso',
                    'finished' => 'Finalizados'
                ];
                return [
                    'name' => $labels[$item->status] ?? $item->status,
                    'value' => $item->value
                ];
            });

        // 3. Top Coleadores (Histograma)
        $topColeadoresData = Score::join('coleadores', 'scores.coleador_id', '=', 'coleadores.id')
            ->select('coleadores.name', DB::raw('SUM(effective_coleadas) as puntos'))
            ->groupBy('coleadores.id', 'coleadores.name')
            ->orderByDesc('puntos')
            ->limit(3)
            ->get()
            ->map(function ($c, $index) {
                $grads = ['gradGold', 'gradSilver', 'gradBronze'];
                return [
                    'name' => explode(' ', $c->name)[0],
                    'puntos' => (int) $c->puntos,
                    'grad' => $grads[$index] ?? 'gradBronze'
                ];
            });

        return Inertia::render('Dashboard', [
            'entriesData' => $entriesData,
            'championshipsData' => $championshipsData,
            'topColeadoresData' => $topColeadoresData,
        ]);
    }
}
