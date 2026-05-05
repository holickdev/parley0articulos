<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
        return Inertia::render('Admin/Championships/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coleadores_count' => 'required|integer|min:1',
            'rounds_count' => 'required|integer|min:1',
            'entry_price' => 'required|numeric|min:0',
            'status' => 'required|in:open,in_progress,finished',
            'coleadores' => 'required|array|min:1',
            'coleadores.*' => 'required|string|max:255'
        ]);

        return DB::transaction(function () use ($validated) {
            $championship = Championship::create([
                'name' => $validated['name'],
                'coleadores_count' => $validated['coleadores_count'],
                'rounds_count' => $validated['rounds_count'],
                'entry_price' => $validated['entry_price'],
                'status' => $validated['status'],
            ]);

            $coleadorIds = collect($validated['coleadores'])
                ->map(fn($name) => Coleador::firstOrCreate(['name' => trim($name)])->id);

            $championship->coleadores()->sync($coleadorIds);

            // Crear las rondas automáticamente
            for ($i = 1; $i <= $validated['rounds_count']; $i++) {
                $championship->rounds()->create(['number' => $i]);
            }

            return redirect()->route('admin.championships.index')->with('success', 'Campeonato creado con éxito con sus rondas.');
        });
    }

    public function edit(Championship $championship)
    {
        return Inertia::render('Admin/Championships/Edit', [
            'championship' => $championship->load('coleadores'),
        ]);
    }

    public function update(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coleadores_count' => 'required|integer|min:1',
            'rounds_count' => 'required|integer|min:1',
            'entry_price' => 'required|numeric|min:0',
            'status' => 'required|in:open,in_progress,finished',
            'coleadores' => 'required|array|min:1',
            'coleadores.*' => 'required|string|max:255'
        ]);

        DB::transaction(function () use ($validated, $championship) {
            $oldRoundsCount = $championship->rounds_count;

            $championship->update([
                'name' => $validated['name'],
                'coleadores_count' => $validated['coleadores_count'],
                'rounds_count' => $validated['rounds_count'],
                'entry_price' => $validated['entry_price'],
                'status' => $validated['status'],
            ]);

            $coleadorIds = collect($validated['coleadores'])
                ->map(fn($name) => Coleador::firstOrCreate(['name' => trim($name)])->id);

            $championship->coleadores()->sync($coleadorIds);

            // Ajustar rondas si cambió el número
            if ($validated['rounds_count'] > $oldRoundsCount) {
                for ($i = $oldRoundsCount + 1; $i <= $validated['rounds_count']; $i++) {
                    $championship->rounds()->create(['number' => $i]);
                }
            } elseif ($validated['rounds_count'] < $oldRoundsCount) {
                $championship->rounds()->where('number', '>', $validated['rounds_count'])->delete();
            }
        });

        return redirect()->route('admin.championships.index')->with('success', 'Campeonato actualizado.');
    }
}
