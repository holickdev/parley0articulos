import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

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

export default function Index({ scores }: { scores: Score[] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Registro de Puntuaciones
                    </h2>
                    <Link href={route('admin.scores.create')}>
                        <PrimaryButton>Cargar Resultado</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Puntuaciones" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campeonato</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">R/T</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Coleador</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-green-50">CE</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-red-50">CN</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-blue-50">TP</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 bg-yellow-50">AR</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {scores.map((score) => (
                                        <tr key={score.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm text-gray-900">{score.turn.round.championship.name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                R{score.turn.round.number} - T{score.turn.number}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900">{score.coleador.name}</td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-green-700 bg-green-50/30">{score.effective_coleadas}</td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-red-700 bg-red-50/30">{score.null_coleadas}</td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-blue-700 bg-blue-50/30">{score.gate_bulls}</td>
                                            <td className="px-4 py-4 text-sm text-center font-bold text-yellow-700 bg-yellow-50/30">{score.articles}</td>
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
                                    <p className="text-gray-500">No se han registrado puntuaciones aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
