<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Score;
use App\Models\Round;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ScoreController extends Controller
{
    public function index(Championship $championship)
    {
        $championship->load(['rounds', 'coleadores']);
        
        // Obtener todas las puntuaciones existentes para este campeonato
        $existingScores = Score::whereHas('round', function ($query) use ($championship) {
            $query->where('championship_id', $championship->id);
        })->get();

        // Estructurar las puntuaciones en un mapa para fácil acceso: [round_id][coleador_id]
        $scoresMap = [];
        foreach ($existingScores as $score) {
            $scoresMap[$score->round_id][$score->coleador_id] = $score;
        }

        // Líder (puntos totales) para el cuadro resumen
        $leaderboard = DB::table('scores')
            ->join('rounds', 'scores.round_id', '=', 'rounds.id')
            ->join('coleadores', 'scores.coleador_id', '=', 'coleadores.id')
            ->where('rounds.championship_id', $championship->id)
            ->select(
                'coleadores.id',
                'coleadores.name',
                DB::raw('SUM(effective_coleadas) as total_effective'),
                DB::raw('SUM(null_coleadas) as total_null'),
                DB::raw('SUM(gate_bulls) as total_gate_bulls'),
                DB::raw('SUM(articles) as total_articles'),
                DB::raw('SUM(effective_coleadas * 10 - null_coleadas * 5 + gate_bulls * 5) as total_points')
            )
            ->groupBy('coleadores.id', 'coleadores.name')
            ->orderByDesc('total_points')
            ->get();

        return Inertia::render('Admin/Scores/Index', [
            'championship' => $championship,
            'rounds' => $championship->rounds,
            'coleadores' => $championship->coleadores,
            'scoresMap' => $scoresMap,
            'leaderboard' => $leaderboard
        ]);
    }

    /**
     * Guardar masivamente las puntuaciones desde la matriz
     */
    public function store(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'scores' => 'required|array',
            'scores.*.*.effective_coleadas' => 'nullable|integer|min:0',
            'scores.*.*.null_coleadas' => 'nullable|integer|min:0',
            'scores.*.*.gate_bulls' => 'nullable|integer|min:0',
            'scores.*.*.articles' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['scores'] as $roundId => $coleadores) {
                foreach ($coleadores as $coleadorId => $data) {
                    // Solo guardar si hay algún valor o si ya existía para actualizar
                    $hasData = ($data['effective_coleadas'] ?? 0) > 0 || 
                              ($data['null_coleadas'] ?? 0) > 0 || 
                              ($data['gate_bulls'] ?? 0) > 0 || 
                              ($data['articles'] ?? 0) > 0;

                    if ($hasData) {
                        Score::updateOrCreate(
                            ['round_id' => $roundId, 'coleador_id' => $coleadorId],
                            [
                                'effective_coleadas' => $data['effective_coleadas'] ?? 0,
                                'null_coleadas' => $data['null_coleadas'] ?? 0,
                                'gate_bulls' => $data['gate_bulls'] ?? 0,
                                'articles' => $data['articles'] ?? 0,
                            ]
                        );
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Puntuaciones guardadas correctamente.');
    }
}
