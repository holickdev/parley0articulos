import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormEventHandler } from 'react';

interface Championship {
    id: number;
    name: string;
    rounds_count: number;
}

interface Round {
    id: number;
    number: number;
}

interface Coleador {
    id: number;
    name: string;
}

interface LeaderboardEntry {
    id: number;
    name: string;
    total_effective: number;
    total_null: number;
    total_gate_bulls: number;
    total_articles: number;
    total_points: number;
}

interface ScoreData {
    effective_coleadas: number | string;
    null_coleadas: number | string;
    gate_bulls: number | string;
    articles: number | string;
}

interface Props {
    championship: Championship;
    rounds: Round[];
    coleadores: Coleador[];
    scoresMap: Record<number, Record<number, ScoreData>>;
    leaderboard: LeaderboardEntry[];
}

export default function Index({ 
    championship, 
    rounds, 
    coleadores, 
    scoresMap, 
    leaderboard 
}: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        scores: rounds.reduce((accR, round) => {
            accR[round.id] = coleadores.reduce((accC, coleador) => {
                const existing = scoresMap[round.id]?.[coleador.id];
                accC[coleador.id] = {
                    effective_coleadas: existing?.effective_coleadas ?? 0,
                    null_coleadas: existing?.null_coleadas ?? 0,
                    gate_bulls: existing?.gate_bulls ?? 0,
                    articles: existing?.articles ?? 0,
                };
                return accC;
            }, {} as Record<number, ScoreData>);
            return accR;
        }, {} as Record<number, Record<number, ScoreData>>)
    });

    const handleInputChange = (roundId: number, coleadorId: number, field: keyof ScoreData, value: string) => {
        const val = value === '' ? '' : parseInt(value);
        setData('scores', {
            ...data.scores,
            [roundId]: {
                ...data.scores[roundId],
                [coleadorId]: {
                    ...data.scores[roundId][coleadorId],
                    [field]: val
                }
            }
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.scores.store', championship.id));
    };

    // Ancho de cada sub-columna de total (en px)
    const colWidth = 40;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Cuadro de Puntuaciones: {championship.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('admin.championships.index')}>
                            <PrimaryButton className="bg-gray-600 hover:bg-gray-700">Volver</PrimaryButton>
                        </Link>
                        <PrimaryButton 
                            onClick={submit} 
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? 'Guardando...' : 'Guardar Todo'}
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Cuadro de Puntuaciones - ${championship.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-[99%] sm:px-4 lg:px-6 space-y-6">
                    
                    {recentlySuccessful && (
                        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                            Cambios guardados correctamente.
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {/* Coleador fijo a la izquierda */}
                                        <th className="border border-gray-300 p-2 text-left sticky left-0 bg-gray-100 z-30 min-w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.1)]" rowSpan={2}>
                                            Coleador
                                        </th>
                                        
                                        {rounds.map(round => (
                                            <th key={round.id} className="border border-gray-300 p-2 text-center bg-indigo-50 min-w-[160px]" colSpan={4}>
                                                Ronda {round.number}
                                            </th>
                                        ))}
                                        
                                        {/* Totales fijos a la derecha */}
                                        <th 
                                            className="border border-gray-300 p-2 text-center bg-gray-800 text-white sticky right-0 z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.2)]" 
                                            colSpan={4}
                                            style={{ minWidth: colWidth * 4 }}
                                        >
                                            TOTALES
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-600">
                                        {rounds.map(round => (
                                            <>
                                                <th key={`ce-${round.id}`} className="border border-gray-300 p-1 text-center bg-green-50 w-10">CE</th>
                                                <th key={`cn-${round.id}`} className="border border-gray-300 p-1 text-center bg-red-50 w-10">CN</th>
                                                <th key={`tp-${round.id}`} className="border border-gray-300 p-1 text-center bg-blue-50 w-10">TP</th>
                                                <th key={`ar-${round.id}`} className="border border-gray-300 p-1 text-center bg-yellow-50 w-10">AR</th>
                                            </>
                                        ))}
                                        {/* Sub-cabeceras de Totales fijas */}
                                        <th className="border border-gray-300 p-1 text-center bg-green-100 text-green-900 sticky z-30 shadow-[-1px_0_0_rgba(0,0,0,0.1)]" style={{ right: colWidth * 3, width: colWidth }}>CE</th>
                                        <th className="border border-gray-300 p-1 text-center bg-red-100 text-red-900 sticky z-30" style={{ right: colWidth * 2, width: colWidth }}>CN</th>
                                        <th className="border border-gray-300 p-1 text-center bg-blue-100 text-blue-900 sticky z-30" style={{ right: colWidth * 1, width: colWidth }}>TP</th>
                                        <th className="border border-gray-300 p-1 text-center bg-yellow-100 text-yellow-900 sticky right-0 z-30" style={{ right: 0, width: colWidth }}>AR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coleadores.map((coleador) => {
                                        let totalCE = 0, totalCN = 0, totalTP = 0, totalAR = 0;
                                        
                                        return (
                                            <tr key={coleador.id} className="hover:bg-gray-50 transition-colors">
                                                {/* Nombre fijo a la izquierda */}
                                                <td className="border border-gray-300 p-2 font-bold sticky left-0 bg-white z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] text-sm">
                                                    {coleador.name}
                                                </td>
                                                
                                                {rounds.map(round => {
                                                    const s = data.scores[round.id]?.[coleador.id] || { effective_coleadas: 0, null_coleadas: 0, gate_bulls: 0, articles: 0 };
                                                    
                                                    totalCE += Number(s.effective_coleadas || 0);
                                                    totalCN += Number(s.null_coleadas || 0);
                                                    totalTP += Number(s.gate_bulls || 0);
                                                    totalAR += Number(s.articles || 0);

                                                    return (
                                                        <>
                                                            <td className="border border-gray-200 p-0">
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full border-none p-2 text-center text-sm focus:ring-1 focus:ring-green-500 bg-transparent" 
                                                                    value={s.effective_coleadas}
                                                                    onChange={(e) => handleInputChange(round.id, coleador.id, 'effective_coleadas', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border border-gray-200 p-0">
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full border-none p-2 text-center text-sm focus:ring-1 focus:ring-red-500 bg-transparent" 
                                                                    value={s.null_coleadas}
                                                                    onChange={(e) => handleInputChange(round.id, coleador.id, 'null_coleadas', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border border-gray-200 p-0">
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full border-none p-2 text-center text-sm focus:ring-1 focus:ring-blue-500 bg-transparent" 
                                                                    value={s.gate_bulls}
                                                                    onChange={(e) => handleInputChange(round.id, coleador.id, 'gate_bulls', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="border border-gray-200 p-0">
                                                                <input 
                                                                    type="text" 
                                                                    className="w-full border-none p-2 text-center text-sm focus:ring-1 focus:ring-yellow-500 bg-transparent" 
                                                                    value={s.articles}
                                                                    onChange={(e) => handleInputChange(round.id, coleador.id, 'articles', e.target.value)}
                                                                />
                                                            </td>
                                                        </>
                                                    );
                                                })}
                                                
                                                {/* Celdas de Totales fijas a la derecha */}
                                                <td className="border border-gray-300 p-2 text-center font-bold bg-green-100 text-green-900 text-sm sticky z-20 shadow-[-1px_0_0_rgba(0,0,0,0.1)]" style={{ right: colWidth * 3 }}>{totalCE}</td>
                                                <td className="border border-gray-300 p-2 text-center font-bold bg-red-100 text-red-900 text-sm sticky z-20" style={{ right: colWidth * 2 }}>{totalCN}</td>
                                                <td className="border border-gray-300 p-2 text-center font-bold bg-blue-100 text-blue-900 text-sm sticky z-20" style={{ right: colWidth * 1 }}>{totalTP}</td>
                                                <td className="border border-gray-300 p-2 text-center font-bold bg-yellow-100 text-yellow-900 text-sm sticky right-0 z-20" style={{ right: 0 }}>{totalAR}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-4">Ranking por Efectividad (CE)</h3>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                            <th className="py-2">Pos</th>
                                            <th className="py-2">Coleador</th>
                                            <th className="py-2 text-center">Total CE</th>
                                            <th className="py-2 text-center">Total CN</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {leaderboard.map((entry, index) => (
                                            <tr key={entry.id}>
                                                <td className="py-2 font-bold">{index + 1}</td>
                                                <td className="py-2">{entry.name}</td>
                                                <td className="py-2 text-center font-black text-green-600">{entry.total_effective}</td>
                                                <td className="py-2 text-center font-medium text-red-600">{entry.total_null}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                         
                         <div className="bg-gray-900 rounded-lg p-6 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span className="mr-2">📊</span> Resumen
                            </h3>
                            <div className="space-y-2 text-sm opacity-90">
                                <p>Campeonato: <strong>{championship.name}</strong></p>
                                <p>Rondas: <strong>{championship.rounds_count}</strong></p>
                                <p className="text-xs italic mt-4">
                                    * Los totales a la derecha se mantienen fijos para comparar fácilmente el desempeño acumulado.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
