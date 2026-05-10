import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FormEventHandler, useState, useMemo, Fragment } from 'react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import ErrorModal from '@/Components/ErrorModal';

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

interface LeaderboardEntry {
    id: number;
    name: string;
    total_effective: number;
    total_null: number;
    total_gate_bulls: number;
    total_articles: number;
    total_points: number;
}

// NUEVO: Interfaz para manejar los artículos como arreglo en la UI
interface ArticleEntry {
    id: string;
    name: string;
    points: number;
}

interface ScoreData {
    effective_coleadas: number | string;
    null_coleadas: number | string;
    gate_bulls: number | string;
    articles: ArticleEntry[]; // Cambiado a arreglo
}

interface Props {
    championship: Championship;
    rounds: Round[];
    coleadores: Coleador[];
    scoresMap: Record<number, Record<number, any>>;
    leaderboard: LeaderboardEntry[];
}

export default function Index({
                                  championship,
                                  rounds,
                                  coleadores,
                                  scoresMap,
                                  leaderboard
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

    // Modal state for summary
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryColeadorId, setSummaryColeadorId] = useState<number | null>(null);

    // Modal state for errors
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    // MODIFICADO: useForm ahora usa transform e inicializa los artículos como Arreglos
    const { data, setData, post, processing, recentlySuccessful, transform, errors } = useForm({
        scores: rounds.reduce((accR, round) => {
            accR[round.id] = coleadores.reduce((accC, coleador) => {
                const existing = scoresMap[round.id]?.[coleador.id];

                // Convertimos el objeto a un Arreglo con ID fijos para React
                const articlesArray = Object.entries(existing?.articles ?? {}).map(([name, points]) => ({
                    id: Math.random().toString(36).substring(2, 9),
                    name: name,
                    points: Number(points)
                }));

                accC[coleador.id] = {
                    effective_coleadas: existing?.effective_coleadas ?? 0,
                    null_coleadas: existing?.null_coleadas ?? 0,
                    gate_bulls: existing?.gate_bulls ?? 0,
                    articles: articlesArray,
                };
                return accC;
            }, {} as Record<string, ScoreData>);
            return accR;
        }, {} as Record<string, Record<string, ScoreData>>)
    });

    // NUEVO: Transforma el arreglo de vuelta a Objeto antes de enviar al backend
    transform((currentData) => {
        const transformedScores: any = {};
        Object.keys(currentData.scores).forEach(roundId => {
            transformedScores[roundId] = {};
            Object.keys(currentData.scores[roundId]).forEach(coleadorId => {
                const cell = currentData.scores[roundId][coleadorId];
                const articlesObj: Record<string, number> = {};

                cell.articles.forEach((a: ArticleEntry) => {
                    if (a.name.trim() !== '') {
                        articlesObj[a.name] = a.points;
                    }
                });

                transformedScores[roundId][coleadorId] = {
                    ...cell,
                    articles: articlesObj
                };
            });
        });
        return {
            ...currentData,
            scores: transformedScores
        };
    });

    // Suma para arreglos de UI
    const sumArticles = (articles: ArticleEntry[]) => {
        return articles.reduce((sum, val) => sum + (Number(val.points) || 0), 0);
    };

    // Suma para el objeto original de la Base de Datos
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
                persistedAR += sumRecordArticles(s?.articles); // Usamos el helper original aquí
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

    const handleInputChange = (roundId: number, coleadorId: number, field: keyof ScoreData, value: string) => {
        const val = value === '' ? '' : parseInt(value);
        const scores = data.scores as any;
        setData('scores', {
            ...scores,
            [roundId]: {
                ...scores[roundId],
                [coleadorId]: {
                    ...scores[roundId][coleadorId],
                    [field]: val
                }
            }
        });
    };

    const handleArticlesChange = (roundId: number, coleadorId: number, articles: ArticleEntry[]) => {
        const scores = data.scores as any;
        setData('scores', {
            ...scores,
            [roundId]: {
                ...scores[roundId],
                [coleadorId]: {
                    ...scores[roundId][coleadorId],
                    articles: articles
                }
            }
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.scores.store', championship.id), {
            preserveScroll: true,
            onError: () => setIsErrorModalOpen(true),
        });
    };

    const openArticlesModal = (roundId: number, coleadorId: number) => {
        setActiveArticleTarget({ roundId, coleadorId });
        setIsArticlesModalOpen(true);
    };

    const openSummaryModal = (coleadorId: number) => {
        setSummaryColeadorId(coleadorId);
        setIsSummaryModalOpen(true);
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

    const activeArticles: ArticleEntry[] = activeArticleTarget
        ? data.scores[activeArticleTarget.roundId][activeArticleTarget.coleadorId].articles
        : [];

    const activeColeadorName = activeArticleTarget
        ? coleadores.find(c => c.id === activeArticleTarget.coleadorId)?.name
        : '';

    const activeRoundNumber = activeArticleTarget
        ? rounds.find(r => r.id === activeArticleTarget.roundId)?.number
        : '';

    return (
        <AuthenticatedLayout>
            <Head title={`Puntuaciones - ${championship.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-[99%] sm:px-4 lg:px-6">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <Link
                                href={route('admin.championships.index')}
                                className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                            >
                                &larr; Volver a Campeonatos
                            </Link>
                            <h1 className="text-3xl font-bold text-parley-brown">
                                Puntuaciones: {championship.name}
                            </h1>
                        </div>
                        <PrimaryButton onClick={submit} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? 'Guardando...' : 'Guardar Todo'}
                        </PrimaryButton>
                    </div>

                    {/* Toolbar de Data Table */}
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

                            {/* Filtro de Rondas */}
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

                        <div className="w-full lg:max-w-md">
                            <div className="relative">
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
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm border border-parley-gold/50">
                        <PaginationControls />
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                                <thead>
                                <tr className="bg-parley-cream">
                                    <th className="border-b border-r border-parley-gold/70 p-2 text-left sm:sticky left-0 bg-parley-cream z-30 min-w-[180px]" rowSpan={2}>Coleador</th>
                                    {filteredRounds.map(round => (
                                        <th key={round.id} className="border-b border-r border-parley-gold/70 p-2 text-center bg-parley-blue text-white min-w-[160px]" colSpan={championship.has_articles ? 4 : 3}>Ronda {round.number}</th>
                                    ))}
                                    <th className="border-b border-l border-parley-brown p-2 text-center bg-parley-brown text-white sm:sticky right-0 z-30" colSpan={championship.has_articles ? 4 : 3} style={{ minWidth: colWidth * (championship.has_articles ? 4 : 3) }}>TOTALES</th>
                                </tr>
                                <tr className="bg-parley-cream text-[10px] uppercase font-bold text-parley-brown">
                                    {filteredRounds.map(round => (
                                        <Fragment key={`sub-header-${round.id}`}>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-green-100 w-10">CE</th>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-red-100 w-10">CN</th>
                                            <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-blue-100 w-10">TP</th>
                                            {championship.has_articles && (
                                                <th className="border-b border-r border-parley-gold/50 p-1 text-center bg-parley-cyan/20 text-parley-dark w-10">AR</th>
                                            )}
                                        </Fragment>
                                    ))}
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-green-200 text-green-900 sm:sticky z-30" style={{ right: colWidth * (championship.has_articles ? 3 : 2), width: colWidth }}>CE</th>
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-red-200 text-red-900 sm:sticky z-30" style={{ right: colWidth * (championship.has_articles ? 2 : 1), width: colWidth }}>CN</th>
                                    <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-blue-200 text-blue-900 sm:sticky z-30" style={{ right: colWidth * (championship.has_articles ? 1 : 0), width: colWidth }}>TP</th>
                                    {championship.has_articles && (
                                        <th className="border-b border-l border-parley-gold/70 p-1 text-center bg-parley-cyan/40 text-yellow-900 sm:sticky right-0 z-30" style={{ right: 0, width: colWidth }}>AR</th>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedColeadores.map((coleador, index) => {
                                    const scores = data.scores as any;
                                    let currentCE = 0, currentCN = 0, currentTP = 0, currentAR = 0;
                                    const rowBgColor = index % 2 === 0 ? 'bg-white' : 'bg-parley-cream';

                                    const ceBg = index % 2 === 0 ? 'bg-green-50' : 'bg-green-100';
                                    const cnBg = index % 2 === 0 ? 'bg-red-50' : 'bg-red-100';
                                    const tpBg = index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100';
                                    const arBg = index % 2 === 0 ? 'bg-parley-cyan/10' : 'bg-parley-cyan/20 text-parley-dark';

                                    return (
                                        <tr key={coleador.id} className={`${rowBgColor} transition-colors group hover:bg-parley-cyan/30`}>
                                            <td className={`border-b border-r border-parley-gold/50 p-2 font-bold sm:sticky left-0 ${rowBgColor} z-20 text-sm group-hover:bg-parley-cyan/30`}>
                                                {coleador.name}
                                            </td>
                                            {filteredRounds.map(round => {
                                                const s = scores[round.id]?.[coleador.id] || { effective_coleadas: 0, null_coleadas: 0, gate_bulls: 0, articles: [] };

                                                currentCE += Number(s.effective_coleadas || 0);
                                                currentCN += Number(s.null_coleadas || 0);
                                                currentTP += Number(s.gate_bulls || 0);
                                                const arTotal = sumArticles(s.articles);
                                                currentAR += arTotal;
                                                return (
                                                    <Fragment key={`cell-${coleador.id}-${round.id}`}>
                                                        <td className="border-b border-r border-parley-gold/50 p-0 transition-colors">
                                                            <input type="text" className="w-full border-none p-2 text-center text-lg font-bold focus:ring-2 focus:ring-parley-red bg-transparent text-green-700"
                                                                   value={s.effective_coleadas} onChange={(e) => handleInputChange(round.id, coleador.id, 'effective_coleadas', e.target.value)} />
                                                        </td>
                                                        <td className="border-b border-r border-parley-gold/50 p-0 transition-colors">
                                                            <input type="text" className="w-full border-none p-2 text-center text-lg font-bold focus:ring-2 focus:ring-parley-red bg-transparent text-red-700"
                                                                   value={s.null_coleadas} onChange={(e) => handleInputChange(round.id, coleador.id, 'null_coleadas', e.target.value)} />
                                                        </td>
                                                        <td className="border-b border-r border-parley-gold/50 p-0 transition-colors">
                                                            <input type="text" className="w-full border-none p-2 text-center text-lg font-bold focus:ring-2 focus:ring-parley-red bg-transparent text-blue-700"
                                                                   value={s.gate_bulls} onChange={(e) => handleInputChange(round.id, coleador.id, 'gate_bulls', e.target.value)} />
                                                        </td>
                                                        {championship.has_articles && (
                                                            <td
                                                                className={`border-b border-r border-parley-gold/50 p-2 text-center text-lg cursor-pointer transition-colors font-black ${arTotal > 0 ? 'text-red-600' : 'text-parley-brown/40'}`}
                                                                onClick={() => openArticlesModal(round.id, coleador.id)}
                                                            >
                                                                {arTotal > 0 ? `-${arTotal}` : '0'}
                                                            </td>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                            <td className={`border-b border-l border-parley-gold/50 p-2 text-center font-black text-green-900 text-lg sm:sticky z-20 ${ceBg} transition-colors group-hover:bg-parley-cyan/30`} style={{ right: colWidth * (championship.has_articles ? 3 : 2) }}>{currentCE - currentAR}</td>
                                            <td className={`border-b border-l border-parley-gold/50 p-2 text-center font-black text-red-900 text-lg sm:sticky z-20 ${cnBg} transition-colors group-hover:bg-parley-cyan/30`} style={{ right: colWidth * (championship.has_articles ? 2 : 1) }}>{currentCN}</td>
                                            <td className={`border-b border-l border-parley-gold/50 p-2 text-center font-black text-blue-900 text-lg sm:sticky z-20 ${tpBg} transition-colors group-hover:bg-parley-cyan/30`} style={{ right: colWidth * (championship.has_articles ? 1 : 0) }}>{currentTP}</td>
                                            {championship.has_articles && (
                                                <td
                                                    className={`border-b border-l border-parley-gold/50 p-2 text-center font-black text-red-700 text-lg sm:sticky right-0 z-20 ${arBg} cursor-pointer hover:underline transition-colors group-hover:bg-parley-cyan/30`}
                                                    style={{ right: 0 }}
                                                    onClick={() => openSummaryModal(coleador.id)}
                                                >
                                                    {currentAR > 0 ? `-${currentAR}` : '0'}
                                                </td>
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

            {/* Modal de Crear/Editar Artículos */}
            <Modal show={isArticlesModalOpen} onClose={() => setIsArticlesModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-parley-brown">
                            Artículos / Restas - Ronda {activeRoundNumber}
                        </h2>
                        <span className="text-parley-red font-bold">{activeColeadorName}</span>
                    </div>

                    <div className="space-y-4">
                        {activeArticles.length === 0 && (
                            <div className="text-center py-4 bg-parley-cream rounded-lg border-2 border-dashed border-parley-gold/30 text-parley-brown/60 italic">
                                No hay artículos registrados para esta ronda.
                            </div>
                        )}

                        {activeArticles.map((article, idx) => (
                            <div key={article.id} className="flex gap-4 items-end bg-parley-cream p-3 rounded-lg border border-parley-gold/30">
                                <div className="w-32 sm:w-48">
                                    <InputLabel value="Nombre" />
                                    <TextInput
                                        value={article.name}
                                        onChange={(e) => {
                                            const newArticles = [...activeArticles];
                                            newArticles[idx] = { ...article, name: e.target.value };
                                            if (activeArticleTarget) handleArticlesChange(activeArticleTarget.roundId, activeArticleTarget.coleadorId, newArticles);
                                        }}
                                        className="w-full mt-1"
                                        placeholder="Ej. 5B"
                                    />
                                </div>
                                <div className="w-20 sm:w-24">
                                    <InputLabel value="Puntos" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        value={article.points.toString()}
                                        onChange={(e) => {
                                            const newArticles = [...activeArticles];
                                            newArticles[idx] = { ...article, points: parseInt(e.target.value) || 0 };
                                            if (activeArticleTarget) handleArticlesChange(activeArticleTarget.roundId, activeArticleTarget.coleadorId, newArticles);
                                        }}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newArticles = activeArticles.filter(a => a.id !== article.id);
                                        if (activeArticleTarget) handleArticlesChange(activeArticleTarget.roundId, activeArticleTarget.coleadorId, newArticles);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors mb-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4 border-t border-parley-gold/20">
                            <button
                                type="button"
                                onClick={() => {
                                    const newArticles = [...activeArticles, {
                                        id: Math.random().toString(36).substring(2, 9),
                                        name: '',
                                        points: 0
                                    }];
                                    if (activeArticleTarget) handleArticlesChange(activeArticleTarget.roundId, activeArticleTarget.coleadorId, newArticles);
                                }}
                                className="inline-flex items-center text-sm font-bold text-parley-red hover:text-parley-brown"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                AGREGAR ARTÍCULO
                            </button>

                            <div className="text-lg font-bold">
                                Total Resta: <span className="text-red-600">-{sumArticles(activeArticles)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={() => setIsArticlesModalOpen(false)}>
                            Cerrar y Revisar
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Modal de Resumen Total */}
            <Modal show={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-parley-brown">
                            Resumen de Artículos
                        </h2>
                        <span className="text-parley-red font-bold">
                            {coleadores.find(c => c.id === summaryColeadorId)?.name}
                        </span>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        {summaryColeadorId && rounds.map(round => {
                            const scores = data.scores;
                            const roundArticles = scores[round.id]?.[summaryColeadorId]?.articles || [];
                            const validArticles = roundArticles.filter((a: ArticleEntry) => a.name.trim() !== '');
                            if (validArticles.length === 0) return null;

                            return (
                                <div key={round.id} className="border-l-4 border-parley-red pl-4 py-1">
                                    <h3 className="text-sm font-bold text-parley-brown/80 mb-2 uppercase">Ronda {round.number}</h3>
                                    <div className="bg-parley-cream rounded-lg p-3 space-y-2">
                                        {validArticles.map((article: ArticleEntry) => (
                                            <div key={`summary-article-${article.id}`} className="flex justify-between items-center text-sm">
                                                <span className="text-parley-brown font-medium">{article.name}</span>
                                                <span className="text-red-600 font-bold">-{article.points}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-parley-gold/30 flex justify-between items-center font-bold text-sm">
                                            <span>Total Ronda</span>
                                            <span className="text-red-700">-{sumArticles(roundArticles)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {summaryColeadorId && rounds.every(r => (data.scores[r.id]?.[summaryColeadorId]?.articles || []).filter((a: ArticleEntry) => a.name.trim() !== '').length === 0) && (
                            <div className="text-center py-8 text-parley-brown/60 italic">
                                No se encontraron artículos registrados para este coleador.
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-parley-gold/20 flex justify-between items-center">
                        <div className="text-lg font-bold">
                            Total Campeonato: <span className="text-red-600">
                                -{summaryColeadorId ? rounds.reduce((acc, r) => acc + sumArticles(data.scores[r.id]?.[summaryColeadorId]?.articles || []), 0) : 0}
                            </span>
                        </div>
                        <PrimaryButton onClick={() => setIsSummaryModalOpen(false)}>
                            Cerrar
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <ErrorModal
                show={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                errors={errors}
            />
        </AuthenticatedLayout>
    );
}
