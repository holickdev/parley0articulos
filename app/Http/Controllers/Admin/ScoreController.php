<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Score;
use App\Models\Turn;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScoreController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Scores/Index', [
            'scores' => Score::with(['turn.round.championship', 'coleador'])->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Scores/Create', [
            'turns' => Turn::with('round.championship')->get(),
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'turn_id' => 'required|exists:turns,id',
            'coleador_id' => 'required|exists:coleadores,id',
            'effective_coleadas' => 'required|integer|min:0',
            'null_coleadas' => 'required|integer|min:0',
            'gate_bulls' => 'required|integer|min:0',
            'articles' => 'required|integer|min:0',
        ]);

        Score::create($validated);

        return redirect()->route('admin.scores.index')->with('success', 'Puntuación registrada con éxito.');
    }

    public function edit(Score $score)
    {
        return Inertia::render('Admin/Scores/Edit', [
            'score' => $score->load(['turn.round.championship', 'coleador']),
            'turns' => Turn::with('round.championship')->get(),
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Score $score)
    {
        $validated = $request->validate([
            'turn_id' => 'required|exists:turns,id',
            'coleador_id' => 'required|exists:coleadores,id',
            'effective_coleadas' => 'required|integer|min:0',
            'null_coleadas' => 'required|integer|min:0',
            'gate_bulls' => 'required|integer|min:0',
            'articles' => 'required|integer|min:0',
        ]);

        $score->update($validated);

        return redirect()->route('admin.scores.index')->with('success', 'Puntuación actualizada con éxito.');
    }

    public function destroy(Score $score)
    {
        $score->delete();

        return redirect()->route('admin.scores.index')->with('success', 'Puntuación eliminada con éxito.');
    }
}
