<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Entry;
use App\Models\Round;
use App\Models\Coleador;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class PublicController extends Controller
{
    public function index()
    {
        return Inertia::render('Guest/Championships/Index', [
            'championships' => Championship::all()
        ]);
    }

    public function entries(Championship $championship, Request $request)
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

        // Paginación real a nivel de SQL
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        // Calcular rank para la página actual
        $paginatedItems = $paginator->getCollection()->map(function ($entry, $index) use ($page, $perPage) {
            $entry->rank = (($page - 1) * $perPage) + $index + 1;
            return $entry;
        });

        return Inertia::render('Guest/Entries/Index', [
            'championship' => $championship->load('coleadores:id,name'),
            'entries' => [
                'data' => $paginatedItems,
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
            'filters' => $request->only(['search', 'sortBy', 'sortDirection', 'perPage'])
        ]);
    }

    /**
     * Construye la consulta SQL completa integrando estadísticas con JoinSub (Misma lógica que Admin)
     */
    private function buildEntriesQuery(Championship $championship, ?string $search, string $sortColumn, string $sortDirection)
    {
        $articleTotals = DB::table('articles')
            ->select('score_id', DB::raw('SUM(points) as total_points'))
            ->groupBy('score_id');

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

        $entryStats = DB::table('entry_coleador')
            ->joinSub($coleadorStats, 'cs', function ($join) {
                $join->on('entry_coleador.coleador_id', '=', 'cs.coleador_id');
            })
            ->select(
                'entry_coleador.entry_id',
                DB::raw('COALESCE(SUM(cs.ce), 0) as total_ce'),
                DB::raw('COALESCE(SUM(cs.cn), 0) as total_cn'),
                DB::raw('COALESCE(SUM(cs.tp), 0) as total_tp'),
                DB::raw('COALESCE(SUM(cs.ar), 0) as total_ar'),
                DB::raw('(COALESCE(SUM(cs.ce), 0) - COALESCE(SUM(cs.ar), 0)) as net_ce')
            )
            ->groupBy('entry_coleador.entry_id');

        $query = Entry::query()
            ->where('entries.championship_id', $championship->id)
            ->leftJoinSub($entryStats, 'es', function ($join) {
                $join->on('entries.id', '=', 'es.entry_id');
            })
            ->select(
                'entries.*',
                DB::raw('COALESCE(es.total_ce, 0) as total_ce'),
                DB::raw('COALESCE(es.total_cn, 0) as total_cn'),
                DB::raw('COALESCE(es.total_tp, 0) as total_tp'),
                DB::raw('COALESCE(es.total_ar, 0) as total_ar'),
                DB::raw('COALESCE(es.net_ce, 0) as net_ce')
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
        $topColeadores = Cache::remember("public_top_coleadores_{$championship->id}", 60, function() use ($championship) {
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

        return response()->json(['message' => 'Combinación disponible', 'hash' => $hash]);
    }
}
