<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Turn;
use App\Models\Round;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TurnController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Turns/Index', [
            'turns' => Turn::with(['round.championship'])->get(),
            'rounds' => Round::with('championship')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'round_id' => 'required|exists:rounds,id',
            'number' => 'required|integer|min:1',
        ]);

        Turn::create($validated);

        return redirect()->route('admin.turns.index')->with('success', 'Turno creado con éxito.');
    }

    public function update(Request $request, Turn $turn)
    {
        $validated = $request->validate([
            'round_id' => 'required|exists:rounds,id',
            'number' => 'required|integer|min:1',
        ]);

        $turn->update($validated);

        return redirect()->route('admin.turns.index')->with('success', 'Turno actualizado con éxito.');
    }

    public function destroy(Turn $turn)
    {
        if ($turn->scores()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar un turno con puntuaciones registradas.');
        }

        $turn->delete();

        return redirect()->route('admin.turns.index')->with('success', 'Turno eliminado con éxito.');
    }
}
