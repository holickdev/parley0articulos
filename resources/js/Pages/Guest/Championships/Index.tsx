import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage } from '@inertiajs/react';

interface Championship {
    id: number;
    name: string;
    coleadores_count: number;
    entry_price: string;
    status: 'open' | 'in_progress' | 'finished';
}

const statusLabels = {
    open: { label: 'Abierto', class: 'bg-green-100 text-green-800' },
    in_progress: { label: 'En Curso', class: 'bg-blue-100 text-blue-800' },
    finished: { label: 'Finalizado', class: 'bg-parley-cream text-parley-brown' },
};

const formatUsd = (value: string | number) => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Index({ championships }: { championships: Championship[] }) {
    return (
        <GuestLayout>
            <Head title="Campeonatos" />

            <div className="py-12 bg-parley-cream min-h-[70vh]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-parley-red mb-2 italic">
                            PARLEY 0 ARTÍCULOS
                        </h1>
                        <p className="text-parley-brown/60 font-medium">Resultados en tiempo real de los Campeonatos de Coleo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {championships.map((championship) => (
                            <div key={championship.id} className="bg-white border border-parley-gold/10 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-xl font-bold text-parley-brown leading-tight tracking-tight">{championship.name}</h3>
                                        <span className={`inline-flex w-fit px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${statusLabels[championship.status].class}`}>
                                            {statusLabels[championship.status].label}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-start border-b border-parley-gold/10 pb-2">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-parley-brown/40">Precio de Inscripción</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-parley-brown">{formatUsd(championship.entry_price)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-parley-gold/10 pb-2">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-parley-brown/40">Nº Coleadores por Cuadro</span>
                                        <span className="text-sm font-bold text-parley-brown">{championship.coleadores_count}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <Link
                                        href={route('public.entries', championship.id)}
                                        className="w-full inline-flex justify-center items-center px-4 py-3 bg-parley-red border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-parley-brown transition-all duration-200 shadow-md"
                                    >
                                        Ver Cuadros
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {championships.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-parley-gold/10 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-parley-gold/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-parley-brown/60 font-bold">No hay campeonatos activos en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
