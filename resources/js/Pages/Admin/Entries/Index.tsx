import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { useState, useMemo } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

interface Coleador {
    id: number;
    name: string;
}

interface Entry {
    id: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
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

export default function Index({ championship, entries }: { championship: Championship, entries: Entry[] }) {
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [modalType, setModalType] = useState<'coleadores' | 'payment' | 'customer' | null>(null);

    // DataTable States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState<'name' | 'customer' | 'amount'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // DataTable Logic
    const formatBs = (value: string | number) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    const toggleSort = (column: 'name' | 'customer' | 'amount') => {
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
                            <Link href={route('admin.championships.entries.create', championship.id)} className="w-full sm:w-auto">
                                <PrimaryButton className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                                    Registrar Cuadro <span className="ml-2 text-lg">+</span>
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>

                    {/* Toolbar de Búsqueda y Filtros */}
                    <div className="bg-white p-4 rounded-t-lg border-x border-t border-parley-gold/50 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
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
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Estado</th>
                                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-parley-brown/60">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-parley-cream/30 transition-colors">
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
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown">{formatBs(entry.payment.amount_bs)}</td>
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
            <Modal show={modalType !== null} onClose={closeModal}>
                <div className="p-6">
                    {modalType === 'coleadores' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-parley-brown border-b border-parley-gold/20 pb-2 mb-4">
                                Coleadores en "{selectedEntry.name}"
                            </h3>
                            <ul className="space-y-2">
                                {selectedEntry.coleadores.map((coleador, idx) => (
                                    <li key={coleador.id} className="flex items-center p-3 bg-parley-cream rounded-lg border border-parley-gold/10">
                                        <span className="w-8 h-8 rounded-full bg-parley-red text-white flex items-center justify-center font-bold mr-3 text-xs shadow-sm">
                                            {idx + 1}
                                        </span>
                                        <span className="text-parley-brown font-bold">{coleador.name}</span>
                                    </li>
                                ))}                            </ul>
                        </div>
                    )}

                    {modalType === 'customer' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-parley-brown border-b border-parley-gold/20 pb-2 mb-4">
                                Datos del Cliente
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Nombre Completo</p>
                                    <p className="text-parley-brown font-bold text-lg">{selectedEntry.customer.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Cédula</p>
                                        <p className="text-parley-brown font-bold">{selectedEntry.customer.identification}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-parley-brown/40 uppercase font-bold tracking-wider">Teléfono</p>
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
                                        <p className="text-xl font-bold text-parley-brown">{formatBs(selectedEntry.payment.amount_bs)}</p>
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
