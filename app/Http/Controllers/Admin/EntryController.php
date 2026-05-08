<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Models\Championship;
use App\Models\Coleador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class EntryController extends Controller
{
    public function downloadPdf(Championship $championship)
    {
        $entries = Entry::where('championship_id', $championship->id)
            ->with(['coleadores.scores' => function($query) use ($championship) {
                $query->whereHas('round', function($q) use ($championship) {
                    $q->where('championship_id', $championship->id);
                });
            }])
            ->get()
            ->map(function ($entry) {
                $totalCE = 0;
                $totalCN = 0;
                $totalTP = 0;
                $totalAR = 0;

                foreach ($entry->coleadores as $coleador) {
                    $coleadorCE = $coleador->scores->sum('effective_coleadas');
                    $coleadorCN = $coleador->scores->sum('null_coleadas');
                    $coleadorTP = $coleador->scores->sum('gate_bulls');
                    $coleadorAR = $coleador->scores->reduce(function ($carry, $score) {
                        $articles = is_array($score->articles) ? $score->articles : [];
                        return $carry + array_sum($articles);
                    }, 0);

                    $coleador->total_ce = $coleadorCE;
                    $coleador->total_cn = $coleadorCN;
                    $coleador->total_tp = $coleadorTP;
                    $coleador->total_ar = $coleadorAR;
                    $coleador->net_ce = $coleadorCE - $coleadorAR;

                    $totalCE += $coleadorCE;
                    $totalCN += $coleadorCN;
                    $totalTP += $coleadorTP;
                    $totalAR += $coleadorAR;
                }

                $entry->total_ce = $totalCE;
                $entry->total_cn = $totalCN;
                $entry->total_tp = $totalTP;
                $entry->total_ar = $totalAR;
                $entry->net_ce = $totalCE - $totalAR;

                return $entry;
            })
            ->sortByDesc('net_ce')
            ->values();

        $pdf = Pdf::loadView('reports.entries_pdf', [
            'championship' => $championship,
            'entries' => $entries,
            'date' => now()->format('d/m/Y H:i'),
            'orientation' => $championship->coleadores_count > 4 ? 'landscape' : 'portrait'
        ]);

        if ($championship->coleadores_count > 4) {
            $pdf->setPaper('a4', 'landscape');
        }

        return $pdf->download("Listado de Cuadros - {$championship->name}.pdf");
    }

    public function index(Championship $championship)
    {
        $entries = Entry::where('championship_id', $championship->id)
            ->with(['coleadores.scores' => function($query) use ($championship) {
                $query->whereHas('round', function($q) use ($championship) {
                    $q->where('championship_id', $championship->id);
                });
            }])
            ->latest()
            ->get()
            ->map(function ($entry) {
                $totalCE = 0;
                $totalCN = 0;
                $totalTP = 0;
                $totalAR = 0;

                foreach ($entry->coleadores as $coleador) {
                    $coleadorCE = $coleador->scores->sum('effective_coleadas');
                    $coleadorCN = $coleador->scores->sum('null_coleadas');
                    $coleadorTP = $coleador->scores->sum('gate_bulls');
                    $coleadorAR = $coleador->scores->reduce(function ($carry, $score) {
                        $articles = is_array($score->articles) ? $score->articles : [];
                        return $carry + array_sum($articles);
                    }, 0);

                    $coleador->total_ce = $coleadorCE;
                    $coleador->total_cn = $coleadorCN;
                    $coleador->total_tp = $coleadorTP;
                    $coleador->total_ar = $coleadorAR;
                    $coleador->net_ce = $coleadorCE - $coleadorAR;

                    $totalCE += $coleadorCE;
                    $totalCN += $coleadorCN;
                    $totalTP += $coleadorTP;
                    $totalAR += $coleadorAR;
                }

                $entry->total_ce = $totalCE;
                $entry->total_cn = $totalCN;
                $entry->total_tp = $totalTP;
                $entry->total_ar = $totalAR;
                $entry->net_ce = $totalCE - $totalAR;

                return $entry;
            })
            ->sortByDesc('net_ce')
            ->values()
            ->map(function ($entry, $index) {
                $entry->rank = $index + 1;
                return $entry;
            });

        $topColeadores = DB::table('entry_coleador')
            ->join('entries', 'entry_coleador.entry_id', '=', 'entries.id')
            ->join('coleadores', 'entry_coleador.coleador_id', '=', 'coleadores.id')
            ->where('entries.championship_id', $championship->id)
            ->select('coleadores.id', 'coleadores.name', DB::raw('count(*) as entries_count'))
            ->groupBy('coleadores.id', 'coleadores.name')
            ->orderByDesc('entries_count')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Entries/Index', [
            'championship' => $championship,
            'entries' => $entries,
            'topColeadores' => $topColeadores
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

        $exists = Entry::where('championship_id', $championship->id)
            ->where('combination_hash', $hash)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'coleadores' => 'Esta combinación de coleadores ya ha sido registrada en este campeonato.'
            ]);
        }

        $lockKey = "lock_entry_{$championship->id}_{$hash}";
        $sessionId = session()->getId();
        $sessionMemoryKey = "locked_hash_{$championship->id}";

        $previousHash = session()->get($sessionMemoryKey);
        if ($previousHash && $previousHash !== $hash) {
            $oldLockKey = "lock_entry_{$championship->id}_{$previousHash}";
            if (Cache::get($oldLockKey) === $sessionId) {
                Cache::forget($oldLockKey);
            }
        }

        $lockAcquired = Cache::add($lockKey, $sessionId, now()->addMinutes(10));

        if (!$lockAcquired) {
            $existingLockOwner = Cache::get($lockKey);
            if ($existingLockOwner !== $sessionId) {
                throw ValidationException::withMessages([
                    'coleadores' => 'Esta combinación está siendo procesada por otro usuario en este momento. Intenta de nuevo en unos minutos.'
                ]);
            }
            Cache::put($lockKey, $sessionId, now()->addMinutes(10));
        }

        session()->put($sessionMemoryKey, $hash);

        return response()->json(['message' => 'Combinación disponible', 'hash' => $hash]);
    }

    public function store(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'phone' => 'nullable|string|max:255',
            'payment_type' => 'nullable|in:pago movil,zelle,usdt',
            'reference' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        sort($validated['coleadores']);
        $hash = implode('-', $validated['coleadores']);
        $lockKey = "lock_entry_{$championship->id}_{$hash}";

        $lockOwner = Cache::get($lockKey);
        if ($lockOwner && $lockOwner !== session()->getId()) {
            throw ValidationException::withMessages([
                'coleadores' => 'Esta combinación se encuentra actualmente reservada por otro usuario. Intente más tarde.'
            ]);
        }

        try {
            return DB::transaction(function () use ($validated, $championship, $hash, $lockKey) {
                $exists = Entry::where('championship_id', $championship->id)
                    ->where('combination_hash', $hash)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'coleadores' => 'Esta combinación de coleadores acaba de ser registrada por otro usuario.'
                    ]);
                }

                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'payment_type' => $validated['payment_type'],
                    'reference' => $validated['reference'],
                    'status' => 'pending',
                    'combination_hash' => $hash,
                ]);

                $entry->coleadores()->sync($validated['coleadores']);

                if (Cache::get($lockKey) === session()->getId()) {
                    Cache::forget($lockKey);
                }

                return redirect()->route('admin.championships.entries.index', $championship->id)
                    ->with('success', 'Cuadro registrado con éxito.');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
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
            'entry' => $entry->load(['coleadores']),
            'coleadores' => $championship->coleadores()->orderBy('name')->get()
        ]);
    }

    public function update(Request $request, Championship $championship, Entry $entry)
    {
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
            'phone' => 'nullable|string|max:255',
            'payment_type' => 'nullable|in:pago movil,zelle,usdt',
            'reference' => 'nullable|string|max:255',
            'status' => 'required|in:pending,approved,rejected',
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        sort($validated['coleadores']);
        $hash = implode('-', $validated['coleadores']);
        $lockKey = "lock_entry_{$championship->id}_{$hash}";

        if ($hash !== $entry->combination_hash) {
            $lockOwner = Cache::get($lockKey);
            if ($lockOwner && $lockOwner !== session()->getId()) {
                throw ValidationException::withMessages([
                    'coleadores' => 'Esta combinación se encuentra actualmente reservada por otro usuario. Intente más tarde.'
                ]);
            }
        }

        try {
            return DB::transaction(function () use ($validated, $championship, $entry, $hash, $lockKey) {
                $exists = Entry::where('championship_id', $championship->id)
                    ->where('combination_hash', $hash)
                    ->where('id', '!=', $entry->id)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'coleadores' => 'Esta combinación de coleadores ya ha sido registrada en este campeonato.'
                    ]);
                }

                $entry->update([
                    'name' => $validated['name'],
                    'phone' => $validated['phone'],
                    'payment_type' => $validated['payment_type'],
                    'reference' => $validated['reference'],
                    'status' => $validated['status'],
                    'combination_hash' => $hash
                ]);

                $entry->coleadores()->sync($validated['coleadores']);

                if (Cache::get($lockKey) === session()->getId()) {
                    Cache::forget($lockKey);
                }

                return redirect()->route('admin.championships.entries.index', $championship->id)
                    ->with('success', 'Cuadro actualizado con éxito.');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                throw ValidationException::withMessages([
                    'coleadores' => 'Lo sentimos, esta combinación de coleadores ya ha sido registrada.'
                ]);
            }
            throw $e;
        }
    }

    public function destroy(Championship $championship, Entry $entry)
    {
        $entry->delete();
        return redirect()->route('admin.championships.entries.index', $championship->id)
            ->with('success', 'Cuadro eliminado correctamente.');
    }
}
