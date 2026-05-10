<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Models\Championship;
use App\Models\Coleador;
use Illuminate\Database\Eloquent\Collection;
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
        $data = $this->getReportData($championship);

        if (request()->wantsJson() || request()->has('json')) {
            return response()->json($data);
        }

        $pdf = Pdf::loadView('reports.entries_pdf', $data);

        if ($championship->coleadores_count > 4) {
            $pdf->setPaper('a4', 'landscape');
        }

        return $pdf->download("Listado de Cuadros - {$championship->name}.pdf");
    }

    private function getReportData(Championship $championship)
    {
        $entries = $this->buildEntriesQuery($championship, null, 'net_ce', 'desc')->get();

        return [
            'championship' => $championship,
            'entries' => $entries, // Rank está presente en cada objeto
            'date' => now()->format('d/m/Y H:i'),
            'orientation' => $championship->coleadores_count > 4 ? 'landscape' : 'portrait'
        ];
    }

    public function index(Championship $championship, Request $request)
    {
        $search = $request->input('search');
        $sortBy = $request->input('sortBy', 'ce');
        $sortDirection = $request->input('sortDirection', 'desc');
        $perPage = (int) $request->input('perPage', 100);
        $page = (int) $request->input('page', 1);

        $sortColumn = match ($sortBy) {
            'name' => 'entries.name',
            'cn' => 'total_cn',
            'tp' => 'total_tp',
            'ar' => 'total_ar',
            default => 'net_ce',
        };

        $query = $this->buildEntriesQuery($championship, $search, $sortColumn, $sortDirection);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Admin/Entries/Index', [
            'championship' => $championship->load('coleadores:id,name'),
            'entries' => [
                'data' => $paginator->items(), // Rank ya viene calculado por MySQL
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
            'filters' => $request->only(['search', 'sortBy', 'sortDirection', 'perPage'])
        ]);
    }
    /**
     * Construye la consulta SQL completa integrando estadísticas con JoinSub
     */
    private function buildEntriesQuery(Championship $championship, ?string $search, string $sortColumn, string $sortDirection)
    {
        // 1. Subconsulta: Totales de Artículos por Score
        $articleTotals = DB::table('articles')
            ->select('score_id', DB::raw('SUM(points) as total_points'))
            ->groupBy('score_id');

        // 2. Subconsulta: Estadísticas consolidadas por Coleador
        $coleadorStats = DB::table('scores')
            ->join('rounds', 'scores.round_id', '=', 'rounds.id')
            ->leftJoinSub($articleTotals, 'at', 'scores.id', '=', 'at.score_id')
            ->where('rounds.championship_id', $championship->id)
            ->select(
                'scores.coleador_id',
                DB::raw('COALESCE(SUM(scores.effective_coleadas), 0) as ce'),
                DB::raw('COALESCE(SUM(scores.null_coleadas), 0) as cn'),
                DB::raw('COALESCE(SUM(scores.gate_bulls), 0) as tp'),
                DB::raw('COALESCE(SUM(at.total_points), 0) as ar')
            )
            ->groupBy('scores.coleador_id');

        // 3. Subconsulta: Estadísticas por Cuadro (Entry) con RANK global incluido
        // Usamos 'entries' como tabla principal aquí para asegurar que todos entren en el cálculo del rango.
        $entryStats = DB::table('entries')
            ->where('entries.championship_id', $championship->id)
            ->leftJoin('entry_coleador', 'entries.id', '=', 'entry_coleador.entry_id')
            ->leftJoinSub($coleadorStats, 'cs', 'entry_coleador.coleador_id', '=', 'cs.coleador_id')
            ->select(
                'entries.id as entry_id',
                DB::raw('COALESCE(SUM(cs.ce), 0) as total_ce'),
                DB::raw('COALESCE(SUM(cs.cn), 0) as total_cn'),
                DB::raw('COALESCE(SUM(cs.tp), 0) as total_tp'),
                DB::raw('COALESCE(SUM(cs.ar), 0) as total_ar'),
                DB::raw('(COALESCE(SUM(cs.ce), 0) - COALESCE(SUM(cs.ar), 0)) as net_ce'),
                // Generación de posición absoluta por base de datos
                DB::raw('RANK() OVER (
                ORDER BY
                (COALESCE(SUM(cs.ce), 0) - COALESCE(SUM(cs.ar), 0)) DESC,
                COALESCE(SUM(cs.ce), 0) DESC,
                COALESCE(SUM(cs.cn), 0) ASC,
                entries.name ASC
            ) as global_rank')
            )
            ->groupBy('entries.id', 'entries.name');

        // 4. Consulta Principal
        $query = Entry::query()
            ->where('entries.championship_id', $championship->id)
            ->joinSub($entryStats, 'es', function ($join) {
                $join->on('entries.id', '=', 'es.entry_id');
            })
            ->select(
                'entries.*',
                'es.total_ce',
                'es.total_cn',
                'es.total_tp',
                'es.total_ar',
                'es.net_ce',
                'es.global_rank as rank' // Exponemos la posición global
            )
            ->with(['coleadores' => function ($q) use ($coleadorStats) {
                $q->leftJoinSub($coleadorStats, 'cs', function($join) {
                    $join->on('coleadores.id', '=', 'cs.coleador_id');
                })
                    ->select(
                        'coleadores.id',
                        'coleadores.name',
                        DB::raw('COALESCE(cs.ce, 0) as total_ce'),
                        DB::raw('COALESCE(cs.cn, 0) as total_cn'),
                        DB::raw('COALESCE(cs.tp, 0) as total_tp'),
                        DB::raw('COALESCE(cs.ar, 0) as total_ar'),
                        DB::raw('(COALESCE(cs.ce, 0) - COALESCE(cs.ar, 0)) as net_ce')
                    );
            }]);

        if ($search) {
            $query->where('entries.name', 'like', "%{$search}%");
        }

        $query->orderBy($sortColumn, $sortDirection)
            ->orderBy('entries.name', 'asc');

        return $query;
    }

    public function getTopColeadores(Championship $championship)
    {
        // Esto está bien, pero puedes ahorrar el get()->toArray() y luego el JSON de la collection.
        $topColeadores = Cache::remember("top_coleadores_{$championship->id}", 60, function() use ($championship) {
            return DB::table('entry_coleador')
                ->join('entries', 'entry_coleador.entry_id', '=', 'entries.id')
                ->join('coleadores', 'entry_coleador.coleador_id', '=', 'coleadores.id')
                ->where('entries.championship_id', $championship->id)
                ->select('coleadores.id', 'coleadores.name', DB::raw('count(*) as entries_count'))
                ->groupBy('coleadores.id', 'coleadores.name')
                ->orderByDesc('entries_count')
                ->limit(10)
                ->get();
        });

        return response()->json($topColeadores);
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
                // 1. Bloqueamos el registro del Campeonato.
                // Esto serializa las peticiones concurrentes para este torneo específico y protege el cálculo del 'number'.
                Championship::where('id', $championship->id)->lockForUpdate()->first();

                $exists = Entry::where('championship_id', $championship->id)
                    ->where('combination_hash', $hash)
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'coleadores' => 'Esta combinación de coleadores acaba de ser registrada por otro usuario.'
                    ]);
                }

                // 2. Calculamos el siguiente número secuencial para este campeonato
                $lastNumber = Entry::where('championship_id', $championship->id)->max('number');
                $nextNumber = $lastNumber ? $lastNumber + 1 : 1;

                $entry = Entry::create([
                    'championship_id' => $championship->id,
                    'number' => $nextNumber,
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
                    ->with('success', "Cuadro #{$nextNumber} registrado con éxito.");
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
