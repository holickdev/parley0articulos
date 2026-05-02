import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Championship {
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

interface Score {
    id: number;
    effective_coleadas: number;
    null_coleadas: number;
    gate_bulls: number;
    articles: number;
    turn: {
        number: number;
        round: {
            number: number;
            championship: { name: string }
        }
    };
    coleador: { name: string };
}

export default function Index({ 
    championship, 
    scores, 
    leaderboard 
}: { 
    championship: Championship, 
    scores: Score[], 
    leaderboard: LeaderboardEntry[] 
}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Tabla de Puntuaciones: {championship.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('admin.championships.index')}>
                            <PrimaryButton className="bg-gray-600 hover:bg-gray-700">Volver a Campeonatos</PrimaryButton>
                        </Link>
                        <Link href={route('admin.championships.scores.create', championship.id)}>
                            <PrimaryButton>Cargar Resultado</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Puntuaciones - ${championship.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* Leaderboard Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Clasificación General</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pos</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Coleador</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-green-50">Total CE</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-red-50">Total CN</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-blue-50">Total TP</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-yellow-50">Total AR</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white bg-indigo-600">Puntos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {leaderboard.map((entry, index) => (
                                            <tr key={entry.id} className={index < 3 ? "bg-yellow-50/20" : ""}>
                                                <td className="px-4 py-4 text-sm font-bold text-gray-900">{index + 1}</td>
                                                <td className="px-4 py-4 text-sm font-bold text-gray-900">{entry.name}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-green-700">{entry.total_effective}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-red-700">{entry.total_null}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-blue-700">{entry.total_gate_bulls}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-yellow-700">{entry.total_articles}</td>
                                                <td className="px-4 py-4 text-sm text-center font-black text-indigo-900 bg-indigo-50">{entry.total_points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {leaderboard.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No hay datos suficientes para generar la clasificación.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Individual Scores Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Historial de Turnos</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">R/T</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Coleador</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">CE</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">CN</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">TP</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">AR</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {scores.map((score) => (
                                            <tr key={score.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    R{score.turn.round.number} - T{score.turn.number}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-bold text-gray-900">{score.coleador.name}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-green-700">{score.effective_coleadas}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-red-700">{score.null_coleadas}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-blue-700">{score.gate_bulls}</td>
                                                <td className="px-4 py-4 text-sm text-center font-bold text-yellow-700">{score.articles}</td>
                                                <td className="px-4 py-4 text-right text-sm font-medium">
                                                    <Link
                                                        href={route('admin.scores.edit', score.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Editar
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {scores.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No se han registrado turnos aún.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
