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
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

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

    public function checkCombination(Request $request, Championship $championship)
    {
        $request->validate([
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        $coleadores = $request->coleadores;
        sort($coleadores);
        $hash = implode('-', $coleadores);

        // 1. Verificación inicial contra la base de datos
        $exists = Entry::where('championship_id', $championship->id)
            ->where('combination_hash', $hash)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'coleadores' => 'Esta combinación de coleadores ya ha sido registrada en este campeonato.'
            ]);
        }

        // 2. Control de concurrencia atómico basado en sesión
        $lockKey = "lock_entry_{$championship->id}_{$hash}";
        $sessionId = session()->getId();

        $lockAcquired = Cache::add($lockKey, $sessionId, now()->addMinutes(10));

        if (!$lockAcquired) {
            // Si la llave existe, verificamos si le pertenece al mismo usuario que hizo la petición
            $existingLockOwner = Cache::get($lockKey);

            if ($existingLockOwner !== $sessionId) {
                throw ValidationException::withMessages([
                    'coleadores' => 'Esta combinación está siendo procesada por otro usuario en este momento. Intenta de nuevo en unos minutos.'
                ]);
            }

            // Si es el mismo usuario (retrocedió en el formulario), le renovamos el tiempo
            Cache::put($lockKey, $sessionId, now()->addMinutes(10));
        }

        return response()->json(['message' => 'Combinación disponible', 'hash' => $hash]);
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

        sort($validated['coleadores']);
        $hash = implode('-', $validated['coleadores']);
        $lockKey = "lock_entry_{$championship->id}_{$hash}";

        // NUEVO: Verificación de respeto de bloqueo (Cierra el vector de ataque directo)
        $lockOwner = Cache::get($lockKey);
        if ($lockOwner && $lockOwner !== session()->getId()) {
            throw ValidationException::withMessages([
                'coleadores' => 'Esta combinación se encuentra actualmente reservada por otro usuario. Intente más tarde.'
            ]);
        }

        try {
            return DB::transaction(function () use ($validated, $championship, $hash, $lockKey) {
                // Double check existence inside transaction
                $exists = Entry::where('championship_id', $championship->id)
                    ->where('combination_hash', $hash)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'coleadores' => 'Esta combinación de coleadores acaba de ser registrada por otro usuario.'
                    ]);
                }

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
                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'customer_id' => $customer->id,
                    'payment_id' => $payment->id,
                    'name' => $validated['entry_name'],
                    'status' => 'pending',
                    'combination_hash' => $hash,
                ]);

                $entry->coleadores()->sync($validated['coleadores']);

                // Release lock
                if (Cache::get($lockKey) === session()->getId()) {
                    Cache::forget($lockKey);
                }

                return redirect()->route('admin.championships.entries.index', $championship->id)
                    ->with('success', 'Cuadro, Cliente y Pago registrados con éxito.');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) { // Unique constraint violation
                throw ValidationException::withMessages([
                    'coleadores' => 'Lo sentimos, esta combinación de coleadores ya ha sido registrada.'
                ]);
            }
            throw $e;
        }
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
