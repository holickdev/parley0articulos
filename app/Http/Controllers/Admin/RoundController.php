<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Round;
use App\Models\Championship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoundController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Rounds/Index', [
            'rounds' => Round::with('championship')->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Rounds/Create', [
            'championships' => Championship::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'championship_id' => 'required|exists:championships,id',
            'number' => 'required|integer|min:1',
        ]);

        Round::create($validated);

        return redirect()->route('admin.rounds.index')->with('success', 'Ronda creada con éxito.');
    }

    public function edit(Round $round)
    {
        return Inertia::render('Admin/Rounds/Edit', [
            'round' => $round,
            'championships' => Championship::all()
        ]);
    }

    public function update(Request $request, Round $round)
    {
        $validated = $request->validate([
            'championship_id' => 'required|exists:championships,id',
            'number' => 'required|integer|min:1',
        ]);

        $round->update($validated);

        return redirect()->route('admin.rounds.index')->with('success', 'Ronda actualizada con éxito.');
    }

    public function destroy(Round $round)
    {
        if ($round->turns()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar una ronda con turnos asociados.');
        }

        $round->delete();

        return redirect()->route('admin.rounds.index')->with('success', 'Ronda eliminada con éxito.');
    }
}
