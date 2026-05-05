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

        // Para el leaderboard, por ahora simplificamos ya que articles es JSON
        // En una app real, podrías usar una columna generada o procesar en PHP
        $leaderboard = []; // Se puede calcular en el frontend o con un proceso más complejo

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
            'scores.*.*.articles' => 'nullable', // Removed strict array validation
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['scores'] as $roundId => $coleadores) {
                foreach ($coleadores as $coleadorId => $data) {
                    $articles = $data['articles'] ?? [];
                    
                    // Asegurar que articles sea un array (puede venir como entero si se guardó mal anteriormente)
                    if (!is_array($articles)) {
                        $articles = !empty($articles) ? [$articles] : [];
                    }

                    // Asegurar que todos los valores de artículos sean positivos
                    if (!empty($articles)) {
                        $articles = array_map(fn($val) => max(0, (int)$val), $articles);
                    }

                    $hasArticles = !empty($articles);
                    $hasData = ($data['effective_coleadas'] ?? 0) > 0 || 
                              ($data['null_coleadas'] ?? 0) > 0 || 
                              ($data['gate_bulls'] ?? 0) > 0 || 
                              $hasArticles;

                    if ($hasData) {
                        Score::updateOrCreate(
                            ['round_id' => $roundId, 'coleador_id' => $coleadorId],
                            [
                                'effective_coleadas' => $data['effective_coleadas'] ?? 0,
                                'null_coleadas' => $data['null_coleadas'] ?? 0,
                                'gate_bulls' => $data['gate_bulls'] ?? 0,
                                'articles' => $articles,
                            ]
                        );
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Puntuaciones guardadas correctamente.');
    }
}
