import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { useState } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import axios from 'axios';
import LoadingToast from '@/Components/LoadingToast';

// PDFMake imports
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(pdfMake as any).vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;

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

interface EntriesResponse {
    data: Entry[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
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
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [topColeadores, setTopColeadores] = useState<TopColeador[]>([]);
    const [isLoadingTop, setIsLoadingTop] = useState(false);

    // ... (rest of states)

    const fetchTopColeadores = async () => {
        setIsLoadingTop(true);
        try {
            const response = await axios.get(route('admin.championships.top-coleadores', championship.id));
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
        router.get(route('admin.championships.entries.index', championship.id), {
            ...filters,
            ...newFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['entries']
        });
    };

    const runSearch = () => {
        updateFilters({ search, page: 1 });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const toggleSort = (column: 'name' | 'ce' | 'cn' | 'tp' | 'ar') => {
        const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDirection(newDirection);
        updateFilters({ sortBy: column, sortDirection: newDirection, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

    const handlePerPageChange = (value: number) => {
        setItemsPerPage(value);
        updateFilters({ perPage: value, page: 1 });
    };

    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    };

    const generatePDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const response = await axios.get(route('admin.championships.entries.pdf', championship.id), {
                params: { json: 1 }
            });
            
            const data = response.data;
            const logo = await getBase64ImageFromURL("/logo.webp").catch(() => null);

            const docDefinition: any = {
                pageSize: 'A4',
                pageOrientation: data.orientation,
                pageMargins: [20, 20, 20, 30],
                content: [
                    {
                        columns: [
                            logo ? { image: logo, width: 50 } : { text: '', width: 50 },
                            {
                                stack: [
                                    { text: 'PARLEY0ARTICULOS', style: 'headerTitle' },
                                    { text: 'CONTROL DE CUADROS', style: 'headerSubtitle' },
                                    { text: championship.name, style: 'headerChampionship' }
                                ],
                                alignment: 'center',
                                margin: [0, 5, 0, 0]
                            },
                            { text: '', width: 50 }
                        ],
                        margin: [0, 0, 0, 15]
                    },
                    {
                        table: {
                            headerRows: 2,
                            stickyHeader: true,
                            widths: [20, '*', ...Array(championship.coleadores_count * 2).fill('auto'), 25, 25, 25, 25],
                            body: [
                                [
                                    { text: '#', style: 'tableHeader', rowSpan: 2 },
                                    { text: 'Nombre del Cuadro', style: 'tableHeader', rowSpan: 2 },
                                    ...Array.from({ length: championship.coleadores_count }).map((_, i) => ({
                                        text: `Coleador ${i + 1}`,
                                        style: 'tableHeader',
                                        colSpan: 2,
                                        alignment: 'center'
                                    })).flatMap(item => [item, {}]),
                                    { text: 'TOTALES CUADRO', style: 'tableHeaderTotal', colSpan: 4, alignment: 'center' },
                                    {}, {}, {}
                                ],
                                [
                                    {}, {},
                                    ...Array.from({ length: championship.coleadores_count }).map(() => [
                                        { text: 'Nombre', style: 'tableHeader' },
                                        { text: 'CE', style: 'tableHeaderCE' }
                                    ]).flat(),
                                    { text: 'CE', style: 'tableHeaderCE' },
                                    { text: 'CN', style: 'tableHeaderCN' },
                                    { text: 'TP', style: 'tableHeaderTP' },
                                    { text: 'AR', style: 'tableHeaderAR' }
                                ],
                                ...data.entries.map((entry: any, index: number) => [
                                    { text: entry.number, style: 'rankCell', alignment: 'center' },
                                    { text: entry.name, style: 'entryName' },
                                    ...Array.from({ length: championship.coleadores_count }).map((_, i) => {
                                        const col = entry.coleadores[i];
                                        return [
                                            { text: col ? col.name : '-', style: 'cellText' },
                                            { text: col ? col.total_ce : '-', style: 'cellCE', alignment: 'center' }
                                        ];
                                    }).flat(),
                                    { text: entry.total_ce, style: 'cellCETotal', alignment: 'center' },
                                    { text: entry.total_cn, style: 'cellCNTotal', alignment: 'center' },
                                    { text: entry.total_tp, style: 'cellTPTotal', alignment: 'center' },
                                    { text: entry.total_ar > 0 ? `-${entry.total_ar}` : '0', style: 'cellARTotal', alignment: 'center' }
                                ])
                            ]
                        },
                        layout: {
                            hLineWidth: () => 0.5,
                            vLineWidth: () => 0.5,
                            hLineColor: () => '#00EAFF44',
                            vLineColor: () => '#00EAFF44',
                            paddingLeft: () => 3,
                            paddingRight: () => 3,
                            paddingTop: () => 4,
                            paddingBottom: () => 4,
                        }
                    }
                ],
                footer: (currentPage: number, pageCount: number) => {
                    return {
                        text: `PARLEY0ARTICULOS — ${championship.name} — Generado el ${data.date} — Pág ${currentPage}/${pageCount}`,
                        style: 'footerStyle',
                        alignment: 'center',
                        margin: [0, 10, 0, 0]
                    };
                },
                styles: {
                    headerTitle: { fontSize: 16, bold: true, color: '#0047FF', characterSpacing: 2 },
                    headerSubtitle: { fontSize: 10, bold: true, color: '#00EAFF' },
                    headerChampionship: { fontSize: 12, bold: true, color: '#001A40' },
                    tableHeader: { fontSize: 7, bold: true, fillColor: '#001A40', color: '#F0F7FF', alignment: 'center' },
                    tableHeaderCE: { fontSize: 7, bold: true, fillColor: '#d1fae5', color: '#065f46', alignment: 'center' },
                    tableHeaderCN: { fontSize: 7, bold: true, fillColor: '#fee2e2', color: '#991b1b', alignment: 'center' },
                    tableHeaderTP: { fontSize: 7, bold: true, fillColor: '#dbeafe', color: '#1e40af', alignment: 'center' },
                    tableHeaderAR: { fontSize: 7, bold: true, fillColor: '#fef9c3', color: '#854d0e', alignment: 'center' },
                    tableHeaderTotal: { fontSize: 7, bold: true, fillColor: '#001A40', color: '#F0F7FF' },
                    cellText: { fontSize: 7 },
                    cellCE: { fontSize: 7, color: '#065f46', bold: true },
                    cellCETotal: { fontSize: 7, color: '#065f46', bold: true, fillColor: '#d1fae5' },
                    cellCNTotal: { fontSize: 7, color: '#991b1b', bold: true, fillColor: '#fee2e2' },
                    cellTPTotal: { fontSize: 7, color: '#1e40af', bold: true, fillColor: '#dbeafe' },
                    cellARTotal: { fontSize: 7, color: '#b91c1c', bold: true, fillColor: '#fef9c3' },
                    rankCell: { fontSize: 7, bold: true, fillColor: '#F0F7FF', color: '#0047FF' },
                    entryName: { fontSize: 7, bold: true, color: '#001A40' },
                    footerStyle: { fontSize: 7, color: '#00EAFF' }
                }
            };

            pdfMake.createPdf(docDefinition).download(`Listado de Cuadros - ${championship.name}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF. Por favor intente de nuevo.");
        } finally {
            setIsGeneratingPdf(false);
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
                        {/* Show limited pages if too many */}
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
                                        <button 
                                            onClick={generatePDF}
                                            disabled={isGeneratingPdf}
                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-parley-brown hover:bg-parley-cream transition-colors disabled:opacity-50"
                                        >
                                            {isGeneratingPdf ? 'Generando...' : 'Imprimir PDF'}
                                        </button>
                                        <button 
                                            onClick={fetchTopColeadores}
                                            disabled={isLoadingTop}
                                            className="block w-full px-4 py-2 text-left text-sm font-bold text-parley-brown hover:bg-parley-cream transition-colors disabled:opacity-50"
                                        >
                                            {isLoadingTop ? 'Cargando...' : 'Más Jugados'}
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

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-parley-brown">Ordenar por</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            const val = e.target.value as any;
                                            setSortBy(val);
                                            updateFilters({ sortBy: val, page: 1 });
                                        }}
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
                                        onClick={() => {
                                            const dir = sortDirection === 'asc' ? 'desc' : 'asc';
                                            setSortDirection(dir);
                                            updateFilters({ sortDirection: dir, page: 1 });
                                        }}
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
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 w-12">#</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('name')}>
                                            <div className="flex items-center gap-1">Cuadro</div>
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-parley-brown/60">Coleadores</th>
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
                                            <td className="px-4 py-4 text-sm font-black text-parley-red">#{entry.number}</td>
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

            <LoadingToast 
                show={isGeneratingPdf} 
                message="Esto puede tardar unos segundos..." 
            />
        </AuthenticatedLayout>
    );
}
