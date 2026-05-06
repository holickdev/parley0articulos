<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Entry;
use App\Models\Round;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Coleador;
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
            'championships' => Championship::withCount('coleadores')->get()
        ]);
    }

    public function entries(Championship $championship)
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

        $topColeadores = Coleador::whereHas('entries', function ($query) use ($championship) {
            $query->where('championship_id', $championship->id);
        })
            ->withCount(['entries' => function ($query) use ($championship) {
                $query->where('championship_id', $championship->id);
            }])
            ->orderBy('entries_count', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Guest/Entries/Index', [
            'championship' => $championship,
            'entries' => $entries,
            'topColeadores' => $topColeadores
        ]);
    }

    public function scores(Championship $championship)
    {
        $rounds = Round::where('championship_id', $championship->id)
            ->with(['scores.coleador'])
            ->orderBy('number')
            ->get();

        $coleadores = $championship->coleadores()->orderBy('name')->get();

        $scoresMap = [];
        foreach ($rounds as $round) {
            foreach ($round->scores as $score) {
                $scoresMap[$round->id][$score->coleador_id] = $score;
            }
        }

        return Inertia::render('Guest/Scores/Index', [
            'championship' => $championship,
            'rounds' => $rounds,
            'coleadores' => $coleadores,
            'scoresMap' => $scoresMap
        ]);
    }

    public function createEntry(Championship $championship)
    {
        return Inertia::render('Guest/Entries/Create', [
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
        $lockAcquired = Cache::add($lockKey, $sessionId, now()->addMinutes(10));

        if (!$lockAcquired && Cache::get($lockKey) !== $sessionId) {
            throw ValidationException::withMessages([
                'coleadores' => 'Esta combinación está siendo procesada por otro usuario en este momento.'
            ]);
        }

        return response()->json(['message' => 'Combinación disponible', 'hash' => $hash]);
    }

    public function storeEntry(Request $request, Championship $championship)
    {
        $validated = $request->validate([
            'customer_identification' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'payment_bank' => 'required|string|max:255',
            'payment_reference' => 'required|string|max:255',
            'payment_amount_bs' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_phone' => 'required|string|max:255',
            'entry_name' => 'required|string|max:255',
            'coleadores' => 'required|array|size:' . $championship->coleadores_count,
            'coleadores.*' => 'exists:coleadores,id'
        ]);

        sort($validated['coleadores']);
        $hash = implode('-', $validated['coleadores']);

        return DB::transaction(function () use ($validated, $championship, $hash) {
            $customer = Customer::firstOrCreate(
                ['identification' => $validated['customer_identification']],
                ['name' => $validated['customer_name'], 'phone' => $validated['customer_phone']]
            );

            $payment = Payment::create([
                'identification' => $validated['customer_identification'],
                'bank' => $validated['payment_bank'],
                'phone' => $validated['payment_phone'],
                'reference' => $validated['payment_reference'],
                'amount_bs' => $validated['payment_amount_bs'],
                'payment_date' => $validated['payment_date'],
            ]);

            $entry = Entry::create([
                'championship_id' => $championship->id,
                'customer_id' => $customer->id,
                'payment_id' => $payment->id,
                'name' => $validated['entry_name'],
                'status' => 'pending',
                'combination_hash' => $hash,
            ]);

            $entry->coleadores()->sync($validated['coleadores']);

            return redirect()->route('public.entries', $championship->id)
                ->with('success', 'Tu cuadro ha sido registrado con éxito y está pendiente de aprobación.');
        });
    }
}
