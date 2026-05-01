<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ColeadorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Coleadores/Index', [
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:coleadores,name',
        ]);

        Coleador::create($validated);

        return redirect()->back()->with('success', 'Coleador creado correctamente.');
    }

    public function update(Request $request, Coleador $coleador)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:coleadores,name,' . $coleador->id,
        ]);

        $coleador->update($validated);

        return redirect()->back()->with('success', 'Coleador actualizado correctamente.');
    }

    public function destroy(Coleador $coleador)
    {
        if ($coleador->entries()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar un coleador que ya participa en cuadros.');
        }

        $coleador->delete();

        return redirect()->back()->with('success', 'Coleador eliminado correctamente.');
    }
}
