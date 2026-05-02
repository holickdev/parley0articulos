<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Models\Championship;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Entries/Index', [
            'entries' => Entry::with(['customer', 'payment', 'championship'])->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Entries/Create', [
            'championships' => Championship::where('status', '!=', 'finished')->get(),
            'customers' => Customer::all(),
            'payments' => Payment::doesntHave('entry')->get(), // Only available payments
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'championship_id' => 'required|exists:championships,id',
            'customer_id' => 'required|exists:customers,id',
            'payment_id' => 'required|exists:payments,id',
            'name' => 'required|string|max:255',
            'status' => 'required|in:pending,approved,rejected',
            'coleadores' => 'required|array',
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        DB::transaction(function () use ($validated) {
            // Generar hash de combinación
            sort($validated['coleadores']);
            $hash = implode('-', $validated['coleadores']);

            $entry = Entry::create([
                'championship_id' => $validated['championship_id'],
                'customer_id' => $validated['customer_id'],
                'payment_id' => $validated['payment_id'],
                'name' => $validated['name'],
                'status' => $validated['status'],
                'combination_hash' => $hash,
            ]);

            $entry->coleadores()->sync($validated['coleadores']);
        });

        return redirect()->route('admin.entries.index')->with('success', 'Cuadro creado manualmente con éxito.');
    }

    public function edit(Entry $entry)
    {
        return Inertia::render('Admin/Entries/Edit', [
            'entry' => $entry->load(['customer', 'payment', 'championship', 'coleadores']),
            'championships' => Championship::all(),
            'customers' => Customer::all(),
            'payments' => Payment::all(),
            'coleadores' => Coleador::orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Entry $entry)
    {
        $validated = $request->validate([
            'championship_id' => 'sometimes|required|exists:championships,id',
            'customer_id' => 'sometimes|required|exists:customers,id',
            'payment_id' => 'sometimes|required|exists:payments,id',
            'name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:pending,approved,rejected',
            'coleadores' => 'sometimes|required|array',
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        DB::transaction(function () use ($validated, $entry) {
            if (isset($validated['coleadores'])) {
                sort($validated['coleadores']);
                $validated['combination_hash'] = implode('-', $validated['coleadores']);
            }

            $entry->update($validated);

            if (isset($validated['coleadores'])) {
                $entry->coleadores()->sync($validated['coleadores']);
            }
        });

        return redirect()->route('admin.entries.index')->with('success', 'Cuadro actualizado con éxito.');
    }

    public function destroy(Entry $entry)
    {
        $entry->delete();
        return redirect()->back()->with('success', 'Cuadro eliminado correctamente.');
    }
}
