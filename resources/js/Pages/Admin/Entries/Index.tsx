import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { useState, useMemo } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

interface Coleador {
    id: number;
    name: string;
    total_ce: number;
    total_cn: number;
    total_tp: number;
    total_ar: number;
    net_ce: number;
    rank: number;
}

interface Entry {
    id: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    total_ce: number;
    total_cn: number;
    total_tp: number;
    total_ar: number;
    net_ce: number;
    rank: number;
    customer: {
        id: number;
        name: string;
        identification: string;
        phone: string;
    };
    payment: {
        id: number;
        reference: string;
        amount_bs: string;
        bank: string;
        payment_date: string;
        phone: string;
    };
    coleadores: Coleador[];
}

interface TopColeador {
    id: number;
    name: string;
    entries_count: number;
}

interface Championship {
    id: number;
    name: string;
}

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
};

export default function Index({ championship, entries, topColeadores }: { championship: Championship, entries: Entry[], topColeadores: TopColeador[] }) {
    const { bcvRate } = usePage().props as any;
    const hasBcv = bcvRate && parseFloat(bcvRate) > 0;

    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [modalType, setModalType] = useState<'coleadores' | 'payment' | 'customer' | 'topColeadores' | null>(null);

    // DataTable States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState<'name' | 'customer' | 'amount' | 'ce' | 'cn' | 'tp' | 'ar'>('ce');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // DataTable Logic
    const formatAmount = (value: string | number) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        const currency = hasBcv ? 'Bs.' : '$';
        return `${currency} ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry =>
                entry.name.toLowerCase().includes(search.toLowerCase()) ||
                entry.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                entry.payment.reference.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                let valA: any, valB: any;

                if (sortBy === 'name') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (sortBy === 'customer') {
                    valA = a.customer.name.toLowerCase();
                    valB = b.customer.name.toLowerCase();
                } else if (sortBy === 'amount') {
                    valA = parseFloat(a.payment.amount_bs);
                    valB = parseFloat(b.payment.amount_bs);
                } else if (sortBy === 'ce') {
                    valA = a.net_ce;
                    valB = b.net_ce;
                } else if (sortBy === 'cn') {
                    valA = a.total_cn;
                    valB = b.total_cn;
                } else if (sortBy === 'tp') {
                    valA = a.total_tp;
                    valB = b.total_tp;
                } else if (sortBy === 'ar') {
                    valA = a.total_ar;
                    valB = b.total_ar;
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [entries, search, sortBy, sortDirection]);

    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSort = (column: 'name' | 'customer' | 'amount' | 'ce' | 'cn' | 'tp' | 'ar') => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const openModal = (entry: Entry, type: 'coleadores' | 'payment' | 'customer') => {
        setSelectedEntry(entry);
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedEntry(null);
        setModalType(null);
    };

    const updateStatus = (id: number, status: string) => {
        if (confirm(`¿Marcar este cuadro como ${status === 'approved' ? 'APROBADO' : 'RECHAZADO'}?`)) {
            router.put(route('admin.championships.entries.update', [championship.id, id]), { status });
        }
    };

    const deleteEntry = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este cuadro?')) {
            router.delete(route('admin.championships.entries.destroy', [championship.id, id]));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Cuadros - ${championship.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href={route('admin.championships.index')}
                            className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                        >
                            &larr; Volver a Campeonatos
                        </Link>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-parley-brown leading-tight">
                                Cuadros: {championship.name}
                            </h1>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <SecondaryButton
                                    onClick={() => setModalType('topColeadores')}
                                    className="justify-center py-3 sm:py-2 text-sm"
                                >
                                    Top 10 Más Jugados
                                </SecondaryButton>
                                <Link href={route('admin.championships.entries.create', championship.id)} className="w-full sm:w-auto">
                                    <PrimaryButton className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                                        Registrar Cuadro <span className="ml-2 text-lg">+</span>
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar de Búsqueda y Filtros */}
                    <div className="bg-white p-4 rounded-t-lg border-x border-t border-parley-gold/50 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-parley-brown">Ver</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border-parley-gold/50 focus:ring-parley-red focus:border-parley-red rounded-md text-sm py-1 pr-8"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm font-medium text-parley-brown">filas</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-parley-brown">Ordenar por</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="border-parley-gold/50 focus:ring-parley-red focus:border-parley-red rounded-md text-sm py-1 pr-8"
                                >
                                    <option value="name">Cuadro</option>
                                    <option value="customer">Cliente</option>
                                    <option value="amount">Monto</option>
                                    <option value="ce">CE (Acumulado)</option>
                                    <option value="cn">CN (Acumulado)</option>
                                    <option value="tp">TP (Acumulado)</option>
                                    <option value="ar">AR (Acumulado)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="p-1.5 bg-parley-cream hover:bg-parley-cream/50 border border-parley-gold/50 rounded-md transition-colors"
                                    title={sortDirection === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
                                >
                                    {sortDirection === 'asc' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-1v12m0 0l-4-4m4 4l4-4" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="w-full lg:max-w-md relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-parley-brown/40" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <TextInput
                                placeholder="Buscar por cuadro, cliente o referencia..."
                                className="pl-10 w-full"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm border border-parley-gold/50">
                        <div className="overflow-x-auto pb-4">
                            <table className="min-w-full divide-y divide-parley-gold/20">
                                <thead className="bg-parley-cream">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 w-12">Pos</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('name')}>
                                            <div className="flex items-center gap-1">
                                                Cuadro
                                                {sortBy === 'name' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Coleadores</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('customer')}>
                                            <div className="flex items-center gap-1">
                                                Cliente
                                                {sortBy === 'customer' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Pago Ref.</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('amount')}>
                                            <div className="flex items-center gap-1">
                                                Monto
                                                {sortBy === 'amount' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('ce')}>
                                            <div className="flex items-center gap-1">
                                                CE
                                                {sortBy === 'ce' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('cn')}>
                                            <div className="flex items-center gap-1">
                                                CN
                                                {sortBy === 'cn' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('tp')}>
                                            <div className="flex items-center gap-1">
                                                TP
                                                {sortBy === 'tp' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('ar')}>
                                            <div className="flex items-center gap-1">
                                                AR
                                                {sortBy === 'ar' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Estado</th>
                                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-parley-brown/60">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedEntries.map((entry, index) => (
                                        <tr key={entry.id} className="hover:bg-parley-cream/30 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown/40">
                                                {entry.rank}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown">{entry.name}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <button
                                                    onClick={() => openModal(entry, 'coleadores')}
                                                    className="inline-flex items-center text-parley-red hover:text-parley-brown transition-colors group"
                                                    title="Ver Coleadores"
                                                >
                                                    <svg className="w-5 h-5 mr-1.5 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="text-xs font-bold">{entry.coleadores.length} Coleadores</span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(entry, 'customer')}
                                                    className="text-parley-brown hover:text-parley-red transition-colors font-bold"
                                                >
                                                    {entry.customer.name}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <button
                                                    onClick={() => openModal(entry, 'payment')}
                                                    className="text-parley-red hover:underline font-bold"
                                                >
                                                    #{entry.payment.reference}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown">{formatAmount(entry.payment.amount_bs)}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-green-700">{entry.net_ce}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-red-700">{entry.total_cn}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-blue-700">{entry.total_tp}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-orange-700">-{entry.total_ar}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${statusStyles[entry.status]}`}>
                                                    {statusLabels[entry.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-medium">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="text-parley-brown/40 hover:text-parley-brown transition-colors">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content>
                                                        {entry.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatus(entry.id, 'approved')}
                                                                    className="block w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-parley-cream"
                                                                >
                                                                    Aprobar
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(entry.id, 'rejected')}
                                                                    className="block w-full px-4 py-2 text-left text-sm font-bold text-orange-600 hover:bg-parley-cream"
                                                                >
                                                                    Rechazar
                                                                </button>
                                                            </>
                                                        )}
                                                        <Dropdown.Link href={route('admin.championships.entries.edit', [championship.id, entry.id])}>
                                                            Editar
                                                        </Dropdown.Link>
                                                        <button
                                                            onClick={() => deleteEntry(entry.id)}
                                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-parley-cream"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedEntries.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-10 text-center text-parley-brown/40 italic">
                                                No se encontraron cuadros en este campeonato.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="bg-parley-cream p-4 border-t border-parley-gold/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-parley-brown/80 font-medium">
                                Mostrando <span className="text-parley-brown font-bold">{paginatedEntries.length}</span> de <span className="text-parley-brown font-bold">{filteredEntries.length}</span> cuadros
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                                    >Anterior</button>
                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${
                                                    currentPage === i + 1
                                                        ? 'bg-parley-red text-white shadow-sm'
                                                        : 'bg-white border border-parley-gold/50 text-parley-brown hover:bg-parley-cream'
                                                }`}
                                            >{i + 1}</button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                                    >Siguiente</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal show={modalType !== null} onClose={closeModal} maxWidth="md">
                <div className="relative p-6">
                    {/* Botón X de Cierre */}
                    <button 
                        onClick={closeModal}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 transition-colors z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {modalType === 'topColeadores' && (
                        <div>
                            <h3 className="text-lg font-bold text-parley-brown border-b border-parley-gold/20 pb-2 mb-4 pr-8">
                                Top 10 Coleadores Más Jugados
                            </h3>
                            <div className="overflow-hidden border-t border-parley-gold/20 bg-white -mx-6">
                                <table className="min-w-full divide-y divide-parley-gold/10 text-sm">
                                    <thead className="bg-parley-cream">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-parley-brown/50 w-16">Pos</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-parley-brown/50">Coleador</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-parley-brown/50 w-24">Cuadros</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-parley-gold/10">
                                        {topColeadores.map((coleador, index) => (
                                            <tr key={coleador.id} className="hover:bg-parley-cream/20 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                                        index === 0 ? 'bg-parley-gold text-white' : 
                                                        index === 1 ? 'bg-gray-400 text-white' : 
                                                        index === 2 ? 'bg-orange-400 text-white' : 
                                                        'bg-parley-cream text-parley-brown'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-parley-brown">
                                                    {coleador.name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-black text-parley-red">
                                                    {coleador.entries_count}
                                                </td>
                                            </tr>
                                        ))}
                                        {topColeadores.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-10 text-center text-parley-brown/40 italic text-sm">
                                                    Aún no hay cuadros registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {modalType === 'coleadores' && selectedEntry && (
                        <div>
                            <div className="flex justify-between items-center border-b border-parley-gold/20 pb-2 mb-4 pr-3">
                                <h3 className="text-lg font-bold text-parley-brown">
                                    Coleadores en "{selectedEntry.name}"
                                </h3>
                                <div className="flex gap-4 text-xs font-bold uppercase text-parley-brown/60">
                                    <span className="w-6 text-center">CE</span>
                                    <span className="w-6 text-center">CN</span>
                                    <span className="w-6 text-center">TP</span>
                                    <span className="w-6 text-center">AR</span>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {selectedEntry.coleadores.map((coleador, idx) => (
                                    <li key={coleador.id} className="flex items-center justify-between p-3 bg-parley-cream rounded-lg border border-parley-gold/10">
                                        <div className="flex items-center">
                                            <span className="w-8 h-8 rounded-full bg-parley-red text-white flex items-center justify-center font-bold mr-3 text-xs shadow-sm flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-parley-brown font-bold">{coleador.name}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm font-bold">
                                            <span className="w-6 text-center text-green-700">{coleador.net_ce}</span>
                                            <span className="w-6 text-center text-red-700">{coleador.total_cn}</span>
                                            <span className="w-6 text-center text-blue-700">{coleador.total_tp}</span>
                                            <span className="w-6 text-center text-orange-700">-{coleador.total_ar}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-parley-gold/20 flex justify-between items-center font-black text-parley-brown text-sm pr-3">
                                <span>TOTAL ACUMULADO</span>
                                <div className="flex gap-4">
                                    <span className="w-6 text-center text-green-700">{selectedEntry.net_ce}</span>
                                    <span className="w-6 text-center text-red-700">{selectedEntry.total_cn}</span>
                                    <span className="w-6 text-center text-blue-700">{selectedEntry.total_tp}</span>
                                    <span className="w-6 text-center text-orange-700">-{selectedEntry.total_ar}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalType === 'customer' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-parley-brown border-b border-parley-gold/20 pb-2 mb-4">
                                Datos del Cliente
                            </h3>
                            <div className="bg-parley-cream p-5 rounded-xl border border-parley-gold/10">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider mb-1">Nombre Completo</p>
                                        <p className="text-parley-brown font-bold leading-tight">{selectedEntry.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider mb-1">Cédula</p>
                                        <p className="text-parley-brown font-bold">{selectedEntry.customer.identification}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider mb-1">Teléfono</p>
                                        <p className="text-parley-brown font-bold">{selectedEntry.customer.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalType === 'payment' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-parley-brown border-b border-parley-gold/20 pb-2 mb-4">
                                Detalle del Pago
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex justify-between items-start bg-parley-cream p-4 rounded-xl border border-parley-gold/10">
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Referencia</p>
                                        <p className="text-2xl font-black text-parley-red tracking-tight">{selectedEntry.payment.reference}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Monto Total</p>
                                        <p className="text-xl font-bold text-parley-brown">{formatAmount(selectedEntry.payment.amount_bs)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 px-1">
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Banco</p>
                                        <p className="text-parley-brown font-bold">{selectedEntry.payment.bank}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Fecha de Operación</p>
                                        <p className="text-parley-brown font-bold">{formatDate(selectedEntry.payment.payment_date)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Teléfono Pago Móvil</p>
                                        <p className="text-parley-brown font-bold">{selectedEntry.payment.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={closeModal}>Entendido</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
