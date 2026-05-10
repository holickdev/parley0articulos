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
        $existingScores = Score::with('articles')->whereHas('round', function ($query) use ($championship) {
            $query->where('championship_id', $championship->id);
        })->get();

        // Estructurar las puntuaciones en un mapa para fácil acceso: [round_id][coleador_id]
        $scoresMap = [];
        foreach ($existingScores as $score) {
            $articles = $score->articles->pluck('points', 'name')->toArray();
            $scoreData = $score->toArray();
            $scoreData['articles'] = $articles;
            $scoresMap[$score->round_id][$score->coleador_id] = $scoreData;
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
            'scores.*.*.articles' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['scores'] as $roundId => $coleadores) {
                foreach ($coleadores as $coleadorId => $data) {
                    $ce = (int)($data['effective_coleadas'] ?? 0);
                    $cn = (int)($data['null_coleadas'] ?? 0);
                    $tp = (int)($data['gate_bulls'] ?? 0);
                    $articlesData = $data['articles'] ?? [];

                    $hasArticles = false;
                    foreach ($articlesData as $points) {
                        if ((int)$points > 0) {
                            $hasArticles = true;
                            break;
                        }
                    }

                    $hasData = $ce > 0 || $cn > 0 || $tp > 0 || $hasArticles;

                    if ($hasData) {
                        $score = Score::updateOrCreate(
                            ['round_id' => $roundId, 'coleador_id' => $coleadorId],
                            [
                                'effective_coleadas' => $ce,
                                'null_coleadas' => $cn,
                                'gate_bulls' => $tp,
                            ]
                        );

                        // Sincronizar artículos
                        $score->articles()->delete();
                        foreach ($articlesData as $name => $points) {
                            $points = (int)$points;
                            if ($points > 0) {
                                $score->articles()->create([
                                    'name' => $name,
                                    'points' => $points,
                                ]);
                            }
                        }
                    } else {
                        $score = Score::where('round_id', $roundId)
                            ->where('coleador_id', $coleadorId)
                            ->first();
                        
                        if ($score) {
                            $score->articles()->delete();
                            $score->delete();
                        }
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Puntuaciones guardadas correctamente.');
    }
}
