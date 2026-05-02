<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Score;
use App\Models\Round;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ScoreController extends Controller
{
    public function index(Championship $championship)
    {
        // Get individual scores for this championship
        $scores = Score::whereHas('round', function ($query) use ($championship) {
            $query->where('championship_id', $championship->id);
        })->with(['round', 'coleador'])->latest()->get();

        // Get leaderboard (aggregated scores per coleador)
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
            'scores' => $scores,
            'leaderboard' => $leaderboard
        ]);
    }

    public function create(Championship $championship)
    {
        return Inertia::render('Admin/Scores/Create', [
            'championship' => $championship,
            'rounds' => Round::where('championship_id', $championship->id)->get(),
            'coleadores' => $championship->coleadores()->orderBy('name')->get()
        ]);
    }

    public function store(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'round_id' => 'required|exists:rounds,id',
            'coleador_id' => 'required|exists:coleadores,id',
            'effective_coleadas' => 'required|integer|min:0',
            'null_coleadas' => 'required|integer|min:0',
            'gate_bulls' => 'required|integer|min:0',
            'articles' => 'required|integer|min:0',
        ]);

        Score::create($validated);

        return redirect()->route('admin.championships.scores.index', $championship)
            ->with('success', 'Puntuación registrada con éxito.');
    }

    public function edit(Score $score)
    {
        $score->load(['round.championship', 'coleador']);
        $championship = $score->round->championship;

        return Inertia::render('Admin/Scores/Edit', [
            'score' => $score,
            'championship' => $championship,
            'rounds' => Round::where('championship_id', $championship->id)->get(),
            'coleadores' => $championship->coleadores()->orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Score $score)
    {
        $validated = $request->validate([
            'round_id' => 'required|exists:rounds,id',
            'coleador_id' => 'required|exists:coleadores,id',
            'effective_coleadas' => 'required|integer|min:0',
            'null_coleadas' => 'required|integer|min:0',
            'gate_bulls' => 'required|integer|min:0',
            'articles' => 'required|integer|min:0',
        ]);

        $score->update($validated);
        $championship = $score->round->championship;

        return redirect()->route('admin.championships.scores.index', $championship)
            ->with('success', 'Puntuación actualizada con éxito.');
    }

    public function destroy(Score $score)
    {
        $championship = $score->round->championship;
        $score->delete();

        return redirect()->route('admin.championships.scores.index', $championship)
            ->with('success', 'Puntuación eliminada con éxito.');
    }
}
