import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
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
    number: string;
    name: string;
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

interface EntriesResponse {
    data: Entry[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export default function Index({ 
    championship, 
    entries, 
    filters
}: { 
    championship: Championship, 
    entries: EntriesResponse, 
    filters: any
}) {
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [modalType, setModalType] = useState<'coleadores' | 'topColeadores' | 'verify' | null>(null);
    const [topColeadores, setTopColeadores] = useState<TopColeador[]>([]);
    const [isLoadingTop, setIsLoadingTop] = useState(false);

    const fetchTopColeadores = async () => {
        setIsLoadingTop(true);
        try {
            const response = await axios.get(route('public.championships.top-coleadores', championship.id));
            setTopColeadores(response.data);
            setModalType('topColeadores');
        } catch (error) {
            console.error("Error fetching top coleadores:", error);
        } finally {
            setIsLoadingTop(false);
        }
    };

    // Verification State
    const [selectedColeadores, setSelectedColeadores] = useState<number[]>([]);
    const [searchTermVerify, setSearchTermVerify] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationMessage, setValidationMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // DataTable States
    const [search, setSearch] = useState(filters.search || '');
    const [itemsPerPage, setItemsPerPage] = useState(filters.perPage || 100);
    const [sortBy, setSortBy] = useState<'name' | 'ce' | 'cn' | 'tp' | 'ar'>(filters.sortBy || 'ce');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(filters.sortDirection || 'desc');

    const updateFilters = (newFilters: any) => {
        router.get(route('public.entries', championship.id), {
            ...filters,
            ...newFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['entries']
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const runSearch = () => {
        updateFilters({ search, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

    const handlePerPageChange = (value: number) => {
        setItemsPerPage(value);
        updateFilters({ perPage: value, page: 1 });
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
            const response = await axios.post(route('public.entries.check', championship.id), {
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

    const paginatedEntries = entries.data;
    const totalPages = entries.last_page;
    const currentPage = entries.current_page;

    const PaginationControls = () => (
        <div className="bg-parley-cream p-4 border-t border-parley-gold/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-parley-brown/80 font-medium text-center sm:text-left">
                Mostrando <span className="text-parley-brown font-bold">{paginatedEntries.length}</span> de <span className="text-parley-brown font-bold">{entries.total}</span> cuadros
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors whitespace-nowrap"
                    >Anterior</button>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                pageNum = currentPage - 3 + i + 1;
                                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-8 h-8 rounded-md text-sm font-bold transition-colors shrink-0 ${
                                        currentPage === pageNum
                                            ? 'bg-parley-red text-white shadow-sm'
                                            : 'bg-white border border-parley-gold/50 text-parley-brown hover:bg-parley-cream'
                                    }`}
                                >{pageNum}</button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors whitespace-nowrap"
                    >Siguiente</button>
                </div>
            )}
        </div>
    );

    return (
        <GuestLayout>
            <Head title={`Cuadros - ${championship.name}`} />

            <div className="py-8 bg-parley-cream min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                        >
                            &larr; Volver a Campeonatos
                        </Link>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-parley-brown leading-tight">
                                {championship.name}
                            </h1>
                            <div className="flex flex-row gap-2 w-full sm:w-auto items-stretch">
                                <PrimaryButton onClick={openVerifyModal} className="flex-1 sm:flex-initial justify-center whitespace-nowrap">
                                    Verificar Ticket
                                </PrimaryButton>
                                <button 
                                    onClick={fetchTopColeadores}
                                    disabled={isLoadingTop}
                                    className="px-4 py-2 bg-white border-2 border-parley-gold/20 rounded-xl text-parley-brown font-bold text-xs uppercase tracking-widest hover:bg-parley-cream transition-all flex-1 sm:flex-initial whitespace-nowrap disabled:opacity-50"
                                >
                                    {isLoadingTop ? 'Cargando...' : 'Más Jugados'}
                                </button>
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
                                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
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
                            </div>

                            <div className="w-full lg:max-w-md flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-parley-brown/40" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        placeholder="Buscar cuadro..."
                                        className="pl-10 w-full"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                                    />
                                </div>
                                <PrimaryButton onClick={runSearch} className="px-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </PrimaryButton>
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
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            <div className="flex items-center gap-1">Cuadro</div>
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-parley-brown/60">Coleadores</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            <div className="flex items-center gap-1">CE</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            <div className="flex items-center gap-1">CN</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            <div className="flex items-center gap-1">TP</div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            <div className="flex items-center gap-1">AR</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedEntries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-parley-cream/30 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown/40">{entry.rank}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-parley-brown italic">{entry.name}</td>
                                            <td className="px-4 py-4 text-sm text-center">
                                                <button
                                                    onClick={() => openModal(entry, 'coleadores')}
                                                    className="inline-flex items-center text-parley-red hover:text-parley-brown transition-colors"
                                                    title={`${entry.coleadores.length} Coleadores`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-green-700">{entry.net_ce}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-red-700">{entry.total_cn}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-blue-700">{entry.total_tp}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-orange-700">-{entry.total_ar}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls />
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
                                        {(Array.isArray(topColeadores) ? topColeadores : []).map((coleador, index) => (
                                            <tr key={`top-col-${coleador.id}-${index}`} className="hover:bg-parley-cream/20 transition-colors">
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
        </GuestLayout>
    );
}
