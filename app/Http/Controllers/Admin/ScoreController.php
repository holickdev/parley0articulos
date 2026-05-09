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
            'scores.*.*.articles' => 'nullable',
        ]);

        $toUpsert = [];
        $toDelete = [];
        $now = now();

        foreach ($validated['scores'] as $roundId => $coleadores) {
            foreach ($coleadores as $coleadorId => $data) {
                $articles = $data['articles'] ?? [];
                
                if (!is_array($articles)) {
                    $articles = !empty($articles) ? [$articles] : [];
                }

                if (!empty($articles)) {
                    $articles = array_map(fn($val) => max(0, (int)$val), $articles);
                }

                $ce = (int)($data['effective_coleadas'] ?? 0);
                $cn = (int)($data['null_coleadas'] ?? 0);
                $tp = (int)($data['gate_bulls'] ?? 0);

                $hasArticles = !empty($articles);
                $hasData = $ce > 0 || $cn > 0 || $tp > 0 || $hasArticles;

                if ($hasData) {
                    $toUpsert[] = [
                        'round_id' => $roundId,
                        'coleador_id' => $coleadorId,
                        'effective_coleadas' => $ce,
                        'null_coleadas' => $cn,
                        'gate_bulls' => $tp,
                        'articles' => json_encode($articles),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                } else {
                    $toDelete[] = [
                        'round_id' => $roundId,
                        'coleador_id' => $coleadorId,
                    ];
                }
            }
        }

        DB::transaction(function () use ($toUpsert, $toDelete) {
            if (!empty($toUpsert)) {
                // MySQL 8.4 handles JSON in upsert correctly. 
                // We use json_encode because upsert bypasses Eloquent casts for the values array.
                Score::upsert($toUpsert, ['round_id', 'coleador_id'], [
                    'effective_coleadas', 
                    'null_coleadas', 
                    'gate_bulls', 
                    'articles', 
                    'updated_at'
                ]);
            }

            if (!empty($toDelete)) {
                foreach ($toDelete as $item) {
                    Score::where('round_id', $item['round_id'])
                        ->where('coleador_id', $item['coleador_id'])
                        ->delete();
                }
                // Optimization: If there are MANY to delete, we could use a more complex query, 
                // but usually only a few scores are wiped to zero at once.
            }
        });

        return redirect()->back()->with('success', 'Puntuaciones guardadas correctamente.');
    }
}
