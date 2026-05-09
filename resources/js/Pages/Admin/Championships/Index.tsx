import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

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
        <AuthenticatedLayout>
            <Head title="Campeonatos" />

            <div className="py-12 bg-parley-cream">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <h1 className="text-2xl sm:text-3xl font-black text-parley-brown uppercase tracking-tight italic">
                            Gestión de Campeonatos
                        </h1>
                        <Link href={route('admin.championships.create')} className="w-full sm:w-auto">
                            <PrimaryButton className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm shadow-md">
                                Registrar Campeonato <span className="ml-2 text-lg">+</span>
                            </PrimaryButton>
                        </Link>
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
                                    <Link
                                        href={route('admin.championships.edit', championship.id)}
                                        className="p-2 text-parley-gold/40 hover:text-parley-red transition-all rounded-full hover:bg-parley-cream"
                                        title="Configuración"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.772.773a1.125 1.125 0 01-1.45.12l-.737-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.772-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </Link>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-start border-b border-parley-gold/10 pb-2">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-parley-brown/40">Precio Cuadro</span>
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
                                        href={route('admin.championships.entries.index', championship.id)}
                                        className="w-full inline-flex justify-center items-center px-4 py-3 bg-parley-red border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-parley-brown transition-all duration-200 shadow-md"
                                    >
                                        Ver Cuadros
                                    </Link>
                                    <Link
                                        href={route('admin.championships.scores.index', championship.id)}
                                        className="w-full inline-flex justify-center items-center px-4 py-3 bg-white border-2 border-parley-red/20 rounded-xl font-bold text-xs text-parley-red uppercase tracking-widest hover:bg-parley-cream transition-all duration-200"
                                    >
                                        Puntuaciones
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {championships.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-parley-gold/10 shadow-sm">
                            <p className="text-parley-brown/60 font-bold uppercase tracking-widest text-xs">No hay campeonatos activos en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
