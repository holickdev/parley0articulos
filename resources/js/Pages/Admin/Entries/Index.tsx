import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { useState, useMemo } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import axios from 'axios';

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
    phone: string;
    payment_type: string;
    reference: string;
    status: 'pending' | 'approved' | 'rejected';
    total_ce: number;
    total_cn: number;
    total_tp: number;
    total_ar: number;
    net_ce: number;
    rank: number;
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
    coleadores_count: number;
    coleadores: { id: number; name: string }[];
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
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [modalType, setModalType] = useState<'coleadores' | 'topColeadores' | 'verify' | null>(null);

    // Verification State
    const [selectedColeadores, setSelectedColeadores] = useState<number[]>([]);
    const [searchTermVerify, setSearchTermVerify] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationMessage, setValidationMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // DataTable States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [sortBy, setSortBy] = useState<'name' | 'ce' | 'cn' | 'tp' | 'ar'>('ce');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry =>
                entry.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                let valA: any, valB: any;

                if (sortBy === 'name') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
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

    const toggleSort = (column: 'name' | 'ce' | 'cn' | 'tp' | 'ar') => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const openModal = (entry: Entry, type: 'coleadores') => {
        setSelectedEntry(entry);
        setModalType(type);
    };

    const openVerifyModal = () => {
        setSelectedColeadores([]);
        setSearchTermVerify('');
        setValidationMessage(null);
        setModalType('verify');
    };

    const closeModal = () => {
        setSelectedEntry(null);
        setModalType(null);
    };

    const handleColeadorToggle = (id: number) => {
        setValidationMessage(null);
        if (selectedColeadores.includes(id)) {
            setSelectedColeadores(selectedColeadores.filter(itemId => itemId !== id));
        } else {
            if (selectedColeadores.length < championship.coleadores_count) {
                setSelectedColeadores([...selectedColeadores, id]);
            }
        }
    };

    const validateCombination = async () => {
        if (selectedColeadores.length !== championship.coleadores_count) return;
        
        setIsValidating(true);
        setValidationMessage(null);

        try {
            const response = await axios.post(route('admin.championships.entries.check', championship.id), {
                coleadores: selectedColeadores
            });
            setValidationMessage({ text: response.data.message || 'Combinación disponible', type: 'success' });
        } catch (error: any) {
            if (error.response?.data?.errors?.coleadores) {
                setValidationMessage({ text: error.response.data.errors.coleadores[0], type: 'error' });
            } else {
                setValidationMessage({ text: 'Error al validar la combinación.', type: 'error' });
            }
        } finally {
            setIsValidating(false);
        }
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

    const PaginationControls = () => (
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
    );

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
                            <div className="flex flex-row gap-2 w-full sm:w-auto items-stretch">
                                <Link href={route('admin.championships.entries.create', championship.id)} className="flex-1 sm:flex-initial">
                                    <PrimaryButton className="w-full justify-center py-3 sm:py-2 text-sm h-full whitespace-nowrap">
                                        Registrar Cuadro +
                                    </PrimaryButton>
                                </Link>
                                
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center px-4 py-2 bg-white border-2 border-parley-gold/20 rounded-xl text-parley-brown hover:bg-parley-cream transition-all duration-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="right" width="48">
                                        <button 
                                            onClick={openVerifyModal}
                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-parley-brown hover:bg-parley-cream transition-colors"
                                        >
                                            Verificar Ticket
                                        </button>
                                        <a 
                                            href={route('admin.championships.entries.pdf', championship.id)} 
                                            target="_blank" 
                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-parley-brown hover:bg-parley-cream transition-colors"
                                        >
                                            Imprimir PDF
                                        </a>
                                        <button 
                                            onClick={() => setModalType('topColeadores')}
                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-parley-brown hover:bg-parley-cream transition-colors"
                                        >
                                            Más Jugados
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-t-lg border-x border-t border-parley-gold/50 shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
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
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                        <option value={300}>300</option>
                                        <option value={400}>400</option>
                                        <option value={500}>500</option>
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
                                        <option value="ce">CE (Acumulado)</option>
                                        <option value="cn">CN (Acumulado)</option>
                                        <option value="tp">TP (Acumulado)</option>
                                        <option value="ar">AR (Acumulado)</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className="p-1.5 bg-parley-cream hover:bg-parley-cream/50 border border-parley-gold/50 rounded-md transition-colors"
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
                                    placeholder="Buscar por nombre de cuadro..."
                                    className="pl-10 w-full"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        <PaginationControls />
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm border border-parley-gold/50">
                        <div className="overflow-x-auto pb-4">
                            <table className="min-w-full divide-y divide-parley-gold/20">
                                <thead className="bg-parley-cream">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 w-12">Pos</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('name')}>
                                            <div className="flex items-center gap-1">Cuadro</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Coleadores</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Teléfono</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Pago</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('ce')}>
                                            <div className="flex items-center gap-1">CE</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('cn')}>
                                            <div className="flex items-center gap-1">CN</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('tp')}>
                                            <div className="flex items-center gap-1">TP</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('ar')}>
                                            <div className="flex items-center gap-1">AR</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">Estado</th>
                                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-parley-brown/60">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-parley-cream/30 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown/40">{entry.rank}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown italic">{entry.name}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <button
                                                    onClick={() => openModal(entry, 'coleadores')}
                                                    className="inline-flex items-center text-parley-red hover:text-parley-brown transition-colors font-bold"
                                                >
                                                    {entry.coleadores.length} Coleadores
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-medium text-parley-brown">{entry.phone}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase text-parley-gold leading-none mb-1">{entry.payment_type}</span>
                                                    <span className="font-bold text-parley-red leading-none">{entry.reference}</span>
                                                </div>
                                            </td>
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
                                </tbody>
                            </table>
                        </div>
                        
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

            <Modal show={modalType !== null} onClose={closeModal} maxWidth={modalType === 'verify' ? '2xl' : 'md'}>
                <div className="relative p-6">
                    <button 
                        onClick={closeModal}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 transition-colors z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {modalType === 'verify' && (
                        <div className="sm:p-2">
                            <h2 className="text-2xl font-bold text-parley-brown mb-2">Verificar Ticket</h2>
                            <p className="text-parley-brown/60 mb-6 text-sm">
                                Selecciona los {championship.coleadores_count} coleadores para verificar si la combinación está disponible.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <InputLabel value="Buscar Coleador" className="mb-1" />
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-parley-gold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                                </div>
                                                <TextInput 
                                                    value={searchTermVerify} 
                                                    onChange={e => setSearchTermVerify(e.target.value)} 
                                                    className="pl-10 w-full" 
                                                    placeholder="Nombre..." 
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-parley-cream px-4 py-2 rounded-xl border border-parley-gold/20 self-end">
                                            <span className="text-sm font-black text-parley-brown/80">
                                                Seleccionados: <span className="text-parley-red">{selectedColeadores.length}</span> / {championship.coleadores_count}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar border border-parley-gold/10 rounded-xl">
                                        {championship.coleadores?.filter(c => c.name.toLowerCase().includes(searchTermVerify.toLowerCase())).map((coleador) => {
                                            const isSelected = selectedColeadores.includes(coleador.id);
                                            const isDisabled = !isSelected && selectedColeadores.length >= championship.coleadores_count;
                                            return (
                                                <label key={coleador.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-parley-cream border-parley-red ring-4 ring-parley-red/5' : 'bg-white border-parley-gold/10 hover:border-parley-gold/40'} ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-parley-red border-parley-red' : 'border-parley-gold/30'}`}>
                                                        {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>}
                                                    </div>
                                                    <input type="checkbox" checked={isSelected} onChange={() => handleColeadorToggle(coleador.id)} disabled={isDisabled} className="hidden" />
                                                    <span className={`ml-3 text-sm font-bold truncate ${isSelected ? 'text-parley-brown' : 'text-parley-brown/70'}`}>{coleador.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {validationMessage && (
                                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${validationMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                            {validationMessage.type === 'success' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                            )}
                                            <span className="text-sm font-bold">{validationMessage.text}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center gap-4 pt-6 border-t border-parley-gold/10">
                                    <SecondaryButton onClick={closeModal} className="w-full justify-center">Cerrar</SecondaryButton>
                                    <PrimaryButton 
                                        onClick={validateCombination} 
                                        disabled={selectedColeadores.length !== championship.coleadores_count || isValidating} 
                                        className="w-full justify-center"
                                    >
                                        {isValidating ? 'Validando...' : 'Verificar'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    )}

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
