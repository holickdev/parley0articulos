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
    public function index(Championship $championship)
    {
        return Inertia::render('Admin/Entries/Index', [
            'championship' => $championship,
            'entries' => Entry::where('championship_id', $championship->id)
                ->with(['customer', 'payment', 'coleadores'])
                ->latest()
                ->get()
        ]);
    }

    public function create(Championship $championship)
    {
        return Inertia::render('Admin/Entries/Create', [
            'championship' => $championship->load('coleadores'),
        ]);
    }

    public function store(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            // Customer data
            'customer_identification' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            
            // Payment data
            'payment_bank' => 'required|string|max:255',
            'payment_reference' => 'required|string|max:255',
            'payment_amount_bs' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_phone' => 'required|string|max:255',
            
            // Entry data
            'entry_name' => 'required|string|max:255',
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        return DB::transaction(function () use ($validated, $championship) {
            // 1. Find or create Customer
            $customer = Customer::firstOrCreate(
                ['identification' => $validated['customer_identification']],
                [
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone']
                ]
            );

            // 2. Create Payment
            $payment = Payment::create([
                'identification' => $validated['customer_identification'],
                'bank' => $validated['payment_bank'],
                'phone' => $validated['payment_phone'],
                'reference' => $validated['payment_reference'],
                'amount_bs' => $validated['payment_amount_bs'],
                'payment_date' => $validated['payment_date'],
            ]);

            // 3. Create Entry
            sort($validated['coleadores']);
            $hash = implode('-', $validated['coleadores']);

            $entry = Entry::create([
                'championship_id' => $championship->id,
                'customer_id' => $customer->id,
                'payment_id' => $payment->id,
                'name' => $validated['entry_name'],
                'status' => 'pending',
                'combination_hash' => $hash,
            ]);

            $entry->coleadores()->sync($validated['coleadores']);

            return redirect()->route('admin.championships.entries.index', $championship->id)
                ->with('success', 'Cuadro, Cliente y Pago registrados con éxito.');
        });
    }

    public function edit(Championship $championship, Entry $entry)
    {
        return Inertia::render('Admin/Entries/Edit', [
            'championship' => $championship,
            'entry' => $entry->load(['customer', 'payment', 'coleadores']),
            'coleadores' => $championship->coleadores()->orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Championship $championship, Entry $entry)
    {
        // If it's a status-only update (usually from the Index page)
        if ($request->has('status') && !$request->has('name')) {
            $validated = $request->validate([
                'status' => 'required|in:pending,approved,rejected',
            ]);

            $entry->update($validated);

            return redirect()->route('admin.championships.entries.index', $championship->id)
                ->with('success', 'Estado del cuadro actualizado con éxito.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:pending,approved,rejected',
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        DB::transaction(function () use ($validated, $entry) {
            sort($validated['coleadores']);
            $validated['combination_hash'] = implode('-', $validated['coleadores']);

            $entry->update([
                'name' => $validated['name'],
                'status' => $validated['status'],
                'combination_hash' => $validated['combination_hash']
            ]);

            $entry->coleadores()->sync($validated['coleadores']);
        });

        return redirect()->route('admin.championships.entries.index', $championship->id)
            ->with('success', 'Cuadro actualizado con éxito.');
    }

    public function destroy(Championship $championship, Entry $entry)
    {
        $entry->delete();
        return redirect()->route('admin.championships.entries.index', $championship->id)
            ->with('success', 'Cuadro eliminado correctamente.');
    }
}
