<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChampionshipController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Championships/Index', [
            'championships' => Championship::withCount('coleadores')->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Championships/Create', [
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coleadores_count' => 'required|integer|min:1',
            'entry_price' => 'required|numeric|min:0',
            'status' => 'required|in:open,in_progress,finished',
            'coleadores' => 'required|array|min:1',
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        $championship = Championship::create([
            'name' => $validated['name'],
            'coleadores_count' => $validated['coleadores_count'],
            'entry_price' => $validated['entry_price'],
            'status' => $validated['status'],
        ]);

        $championship->coleadores()->sync($validated['coleadores']);

        return redirect()->route('admin.championships.index')->with('success', 'Campeonato creado con éxito.');
    }

    public function edit(Championship $championship)
    {
        return Inertia::render('Admin/Championships/Edit', [
            'championship' => $championship->load('coleadores'),
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coleadores_count' => 'required|integer|min:1',
            'entry_price' => 'required|numeric|min:0',
            'status' => 'required|in:open,in_progress,finished',
            'coleadores' => 'required|array|min:1',
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        $championship->update([
            'name' => $validated['name'],
            'coleadores_count' => $validated['coleadores_count'],
            'entry_price' => $validated['entry_price'],
            'status' => $validated['status'],
        ]);

        $championship->coleadores()->sync($validated['coleadores']);

        return redirect()->route('admin.championships.index')->with('success', 'Campeonato actualizado con éxito.');
    }
}
