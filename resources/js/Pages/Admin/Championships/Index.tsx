import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Championship {
    id: number;
    name: string;
    coleadores_count: number;
    entry_price: string;
    status: 'open' | 'in_progress' | 'finished';
    coleadores_count_count?: number; // from withCount('coleadores')
}

const statusLabels = {
    open: { label: 'Abierto', class: 'bg-green-100 text-green-800' },
    in_progress: { label: 'En Curso', class: 'bg-blue-100 text-blue-800' },
    finished: { label: 'Finalizado', class: 'bg-gray-100 text-gray-800' },
};

export default function Index({ championships }: { championships: Championship[] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Campeonatos
                    </h2>
                    <Link href={route('admin.championships.create')}>
                        <PrimaryButton>Nuevo Campeonato</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Campeonatos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {championships.map((championship) => (
                                    <div key={championship.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">{championship.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusLabels[championship.status].class}`}>
                                                {statusLabels[championship.status].label}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-gray-600 mb-6">
                                            <div className="flex justify-between">
                                                <span>Precio Cuadro:</span>
                                                <span className="font-semibold text-gray-900">{championship.entry_price} Bs.</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Coleadores por Cuadro:</span>
                                                <span className="font-semibold text-gray-900">{championship.coleadores_count}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Participantes Registrados:</span>
                                                <span className="font-semibold text-gray-900">{championship.coleadores_count_count || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 border-t pt-4">
                                            <div className="flex justify-between items-center">
                                                <Link
                                                    href={route('admin.championships.entries.create', championship.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    Registrar Cuadro
                                                </Link>
                                                <Link
                                                    href={route('admin.championships.edit', championship.id)}
                                                    className="text-sm font-medium text-gray-600 hover:text-indigo-900"
                                                >
                                                    Configuración
                                                </Link>
                                            </div>
                                            <Link
                                                href={route('admin.championships.entries.index', championship.id)}
                                                className="inline-flex justify-center items-center px-3 py-2 border border-green-600 text-sm leading-4 font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                Ver Cuadros
                                            </Link>
                                            <Link
                                                href={route('admin.championships.scores.index', championship.id)}
                                                className="inline-flex justify-center items-center px-3 py-2 border border-indigo-600 text-sm leading-4 font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                Ver Puntuaciones
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {championships.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No hay campeonatos registrados.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
