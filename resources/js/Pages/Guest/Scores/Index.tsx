import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState, useMemo, Fragment } from 'react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

interface Championship {
    id: number;
    name: string;
    rounds_count: number;
    has_articles: boolean;
}

interface Round {
    id: number;
    number: number;
}

interface Coleador {
    id: number;
    name: string;
}

interface Props {
    championship: Championship;
    rounds: Round[];
    coleadores: Coleador[];
    scoresMap: Record<number, Record<number, any>>;
}

export default function Index({
                                  championship,
                                  rounds,
                                  coleadores,
                                  scoresMap,
                              }: Props) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState('ce'); // ce, cn, tp, ar, name
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [visibleRounds, setVisibleRounds] = useState<number[]>(rounds.map(r => r.id));
    const [isRoundsMenuOpen, setIsRoundsMenuOpen] = useState(false);

    // Modal state for articles
    const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);
    const [activeArticleTarget, setActiveArticleTarget] = useState<{roundId: number, coleadorId: number} | null>(null);

    const sumRecordArticles = (articles: Record<string, number> | undefined) => {
        if (!articles) return 0;
        return Object.values(articles).reduce((sum, val) => sum + Number(val), 0);
    };

    const toggleRound = (roundId: number) => {
        setVisibleRounds(prev =>
            prev.includes(roundId)
                ? prev.filter(id => id !== roundId)
                : [...prev, roundId]
        );
    };

    const filteredRounds = useMemo(() => {
        return rounds.filter(r => visibleRounds.includes(r.id));
    }, [rounds, visibleRounds]);

    const processedColeadores = useMemo(() => {
        return coleadores.map(coleador => {
            let persistedCE = 0, persistedCN = 0, persistedTP = 0, persistedAR = 0;

            filteredRounds.forEach(r => {
                const s = scoresMap[r.id]?.[coleador.id];
                persistedCE += Number(s?.effective_coleadas || 0);
                persistedCN += Number(s?.null_coleadas || 0);
                persistedTP += Number(s?.gate_bulls || 0);
                persistedAR += sumRecordArticles(s?.articles);
            });
            const persistedNetCE = persistedCE - persistedAR;
            return { ...coleador, persistedCE, persistedCN, persistedTP, persistedAR, persistedNetCE };
        })
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                let valA: any, valB: any;

                switch(sortBy) {
                    case 'name': valA = a.name; valB = b.name; break;
                    case 'ce': valA = a.persistedNetCE; valB = b.persistedNetCE; break;
                    case 'cn': valA = a.persistedCN; valB = b.persistedCN; break;
                    case 'tp': valA = a.persistedTP; valB = b.persistedTP; break;
                    case 'ar': valA = a.persistedAR; valB = b.persistedAR; break;
                    default: valA = a.persistedNetCE; valB = b.persistedNetCE;
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [coleadores, search, scoresMap, filteredRounds, sortBy, sortDirection]);

    const totalPages = Math.ceil(processedColeadores.length / itemsPerPage);
    const paginatedColeadores = processedColeadores.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openArticlesModal = (roundId: number, coleadorId: number) => {
        setActiveArticleTarget({ roundId, coleadorId });
        setIsArticlesModalOpen(true);
    };

    const colWidth = 40;

    const PaginationControls = () => (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-parley-cream p-4 border-x border-b border-parley-gold/50">
            <div className="text-sm text-parley-brown/80 font-medium">
                Mostrando <span className="text-parley-brown font-bold">{paginatedColeadores.length}</span> de <span className="text-parley-brown font-bold">{processedColeadores.length}</span> coleadores
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                    >
                        Anterior
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                                if (Math.abs(p - currentPage) === 3) return <span key={p} className="px-1 text-parley-brown/40">...</span>;
                                return null;
                            }
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${
                                        currentPage === p
                                            ? 'bg-parley-red text-white shadow-sm'
                                            : 'bg-white border border-parley-gold/50 text-parley-brown hover:bg-parley-cream'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );

    const activeArticles = activeArticleTarget
        ? Object.entries(scoresMap[activeArticleTarget.roundId]?.[activeArticleTarget.coleadorId]?.articles || {})
        : [];

    return (
        <GuestLayout>
            <Head title={`Puntuaciones - ${championship.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-[99%] sm:px-4 lg:px-6">
                    <div className="mb-8">
                        <Link
                            href={route('home')}
                            className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                        >
                            &larr; Volver a Campeonatos
                        </Link>
                        <h1 className="text-3xl font-bold text-parley-brown">
                            Resultados: {championship.name}
                        </h1>
                    </div>

                    {/* Toolbar de Data Table - IDÉNTICO A ADMIN */}
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
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm font-medium text-parley-brown">filas</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-parley-brown">Ordenar por</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-parley-gold/50 focus:ring-parley-red focus:border-parley-red rounded-md text-sm py-1 pr-8"
                                >
                                    <option value="name">Nombre</option>
                                    <option value="ce">Total CE</option>
                                    <option value="cn">Total CN</option>
                                    <option value="tp">Total TP</option>
                                    {championship.has_articles && <option value="ar">Total AR</option>}
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

                            {/* Filtro de Rondas Mejorado - IDÉNTICO A ADMIN */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsRoundsMenuOpen(!isRoundsMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-parley-gold/50 rounded-md text-sm font-medium text-parley-brown hover:bg-parley-cream transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-parley-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Rondas ({visibleRounds.length})
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isRoundsMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isRoundsMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsRoundsMenuOpen(false)}></div>
                                        <div className="absolute left-0 mt-2 w-48 bg-white border border-parley-gold/30 rounded-md shadow-lg z-50 p-2">
                                            <div className="mb-2 pb-2 border-b border-parley-gold/20 flex justify-between px-2">
                                                <button
                                                    type="button"
                                                    className="text-[10px] text-parley-red font-bold hover:underline"
                                                    onClick={() => setVisibleRounds(rounds.map(r => r.id))}
                                                >Todas</button>
                                                <button
                                                    type="button"
                                                    className="text-[10px] text-red-600 font-bold hover:underline"
                                                    onClick={() => setVisibleRounds([])}
                                                >Ninguna</button>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {rounds.map(round => (
                                                    <label key={round.id} className="flex items-center px-2 py-1.5 hover:bg-parley-cream rounded cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={visibleRounds.includes(round.id)}
                                                            onChange={() => toggleRound(round.id)}
                                                            className="rounded border-parley-gold/50 text-parley-red focus:ring-parley-red h-4 w-4"
                                                        />
                                                        <span className="ml-2 text-sm text-parley-brown">Ronda {round.number}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:max-w-md relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-parley-brown/40" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <TextInput
                                placeholder="Buscar por nombre de coleador..."
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
                        <PaginationControls />
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                                <thead>
                                <tr className="bg-parley-cream">
                                    <th className="border-b border-r border-parley-gold/70 p-2 text-left sm:sticky left-0 bg-parley-cream z-30 min-w-[180px]" rowSpan={2}>Coleador</th>
                                    {filteredRounds.map(round => (
                                        <th key={round.id} className="border-b border-r border-parley-gold/70 p-2 text-center bg-[#F2E8D9] min-w-[160px]" colSpan={championship.has_articles ? 4 : 3}>Ronda {round.number}</th>
                                    ))}
                                    <th className="border-b border-l border-parley-brown p-2 text-center bg-parley-brown text-white sm:sticky right-0 z-30 font-black" colSpan={championship.has_articles ? 4 : 3} style={{ minWidth: colWidth * (championship.has_articles ? 4 : 3) }}>TOTALES</th>
                                </tr>
                                <tr className="bg-parley-cream text-[10px] uppercase font-bold text-parley-brown">
                                    {filteredRounds.map(round => (
                                        <Fragment key={`sub-header-${round.id}`}>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-green-50 w-10">CE</th>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-red-50 w-10">CN</th>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-blue-50 w-10">TP</th>
                                            {championship.has_articles && (
                                                <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-yellow-50 w-10">AR</th>
                                            )}
                                        </Fragment>
                                    ))}
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-green-200 text-green-900 sm:sticky z-30 font-black" style={{ right: colWidth * (championship.has_articles ? 3 : 2), width: colWidth }}>CE</th>
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-red-200 text-red-900 sm:sticky z-30 font-black" style={{ right: colWidth * (championship.has_articles ? 2 : 1), width: colWidth }}>CN</th>
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-blue-200 text-blue-900 sm:sticky z-30 font-black" style={{ right: colWidth * (championship.has_articles ? 1 : 0), width: colWidth }}>TP</th>
                                    {championship.has_articles && (
                                        <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-yellow-200 text-yellow-900 sm:sticky right-0 z-30 font-black" style={{ right: 0, width: colWidth }}>AR</th>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedColeadores.map((coleador, index) => {
                                    const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-parley-cream';
                                    let currentCE = 0, currentCN = 0, currentTP = 0, currentAR = 0;

                                    return (
                                        <tr key={coleador.id} className={`${rowBgColor} hover:bg-[#F2E8D9] transition-colors group`}>
                                            <td className={`border-b border-r border-parley-gold/50 p-2 font-bold sm:sticky left-0 ${rowBgColor} z-20 text-sm group-hover:bg-[#F2E8D9]`}>
                                                {coleador.name}
                                            </td>
                                            {filteredRounds.map(round => {
                                                const s = scoresMap[round.id]?.[coleador.id];
                                                const arTotal = sumRecordArticles(s?.articles);
                                                currentCE += Number(s?.effective_coleadas || 0);
                                                currentCN += Number(s?.null_coleadas || 0);
                                                currentTP += Number(s?.gate_bulls || 0);
                                                currentAR += arTotal;

                                                return (
                                                    <Fragment key={`cell-${coleador.id}-${round.id}`}>
                                                        <td className="border-b border-r border-parley-gold/50 px-1 py-3 text-center text-lg font-bold text-parley-brown">{s?.effective_coleadas || 0}</td>
                                                        <td className="border-b border-r border-parley-gold/50 px-1 py-3 text-center text-lg font-bold text-parley-brown">{s?.null_coleadas || 0}</td>
                                                        <td className="border-b border-r border-parley-gold/50 px-1 py-3 text-center text-lg font-bold text-parley-brown">{s?.gate_bulls || 0}</td>
                                                        {championship.has_articles && (
                                                            <td className={`border-b border-r border-parley-gold/50 px-1 py-3 text-center text-lg font-black cursor-pointer hover:underline ${arTotal > 0 ? 'text-red-600' : 'text-parley-brown/40'}`} onClick={() => arTotal > 0 && openArticlesModal(round.id, coleador.id)}>
                                                                {arTotal > 0 ? `-${arTotal}` : '0'}
                                                            </td>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                            <td className={`border-b border-l border-parley-gold/50 px-1 py-3 text-center font-black text-green-900 text-lg sm:sticky z-20 bg-green-100 group-hover:bg-green-200 transition-colors`} style={{ right: colWidth * (championship.has_articles ? 3 : 2) }}>{currentCE - currentAR}</td>
                                            <td className={`border-b border-l border-parley-gold/50 px-1 py-3 text-center font-black text-red-900 text-lg sm:sticky z-20 bg-red-100 group-hover:bg-red-200 transition-colors`} style={{ right: colWidth * (championship.has_articles ? 2 : 1) }}>{currentCN}</td>
                                            <td className={`border-b border-l border-parley-gold/50 px-1 py-3 text-center font-black text-blue-900 text-lg sm:sticky z-20 bg-blue-100 group-hover:bg-blue-200 transition-colors`} style={{ right: colWidth * (championship.has_articles ? 1 : 0) }}>{currentTP}</td>
                                            {championship.has_articles && (
                                                <td className={`border-b border-l border-parley-gold/50 px-1 py-3 text-center font-black text-red-700 text-lg sm:sticky right-0 z-20 bg-yellow-100 group-hover:bg-yellow-200 transition-colors`} style={{ right: 0 }}>{currentAR > 0 ? `-${currentAR}` : '0'}</td>
                                            )}
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls />
                    </div>
                </div>
            </div>

            <Modal show={isArticlesModalOpen} onClose={() => setIsArticlesModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-parley-brown mb-4 border-b border-parley-gold/20 pb-2">Detalle de Artículos / Restas</h2>
                    <div className="space-y-3">
                        {activeArticles.length > 0 ? activeArticles.map(([name, points], i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-parley-cream rounded-lg border border-parley-gold/10">
                                <span className="font-bold text-parley-brown">{name}</span>
                                <span className="font-black text-red-600">-{points}</span>
                            </div>
                        )) : (
                            <p className="text-center text-parley-brown/40 py-4 italic">No hay artículos registrados.</p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={() => setIsArticlesModalOpen(false)}>Cerrar</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </GuestLayout>
    );
}
