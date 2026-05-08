import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

const COLORS = {
    approved: ['#4ade80', '#22c55e'],
    pending: ['#fbbf24', '#f59e0b'],
    rejected: ['#f87171', '#ef4444'],
    championships: ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b'],
    top: [
        { stop1: '#fcd34d', stop2: '#fbbf24' }, // Gold
        { stop1: '#e2e8f0', stop2: '#94a3b8' }, // Silver
        { stop1: '#d97706', stop2: '#b45309' }, // Bronze
    ],
};

interface DashboardProps {
    entriesData: any[];
    championshipsData: any[];
    topColeadoresData: any[];
}

export default function Dashboard({ entriesData, championshipsData, topColeadoresData }: DashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin" />

            <div className="min-h-[calc(100vh-65px)] lg:h-[calc(100vh-65px)] bg-parley-cream lg:overflow-hidden flex flex-col">
                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col h-full py-6">
                    <div className="mb-6 flex-shrink-0 overflow-hidden">
                        <h1 className="text-xl sm:text-3xl font-extrabold text-parley-red tracking-tight italic whitespace-nowrap">
                            ADMIN <span className="text-parley-brown">PARLEY 0 ARTÍCULOS</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-y-auto lg:overflow-hidden pb-6 custom-scrollbar">
                        {/* 1. Dona (Estatus de Cuadros) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-parley-gold/10 flex flex-col min-h-[400px] lg:min-h-0 h-full">
                            <h3 className="text-xl font-bold text-parley-brown mb-1">Estatus de Cuadros</h3>
                            <p className="text-[10px] text-parley-brown/40 mb-4 font-bold uppercase tracking-wider">Validación</p>
                            <div className="flex-grow w-full">
                                {entriesData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.approved[0]} />
                                                    <stop offset="95%" stopColor={COLORS.approved[1]} />
                                                </linearGradient>
                                                <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.pending[0]} />
                                                    <stop offset="95%" stopColor={COLORS.pending[1]} />
                                                </linearGradient>
                                                <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.rejected[0]} />
                                                    <stop offset="95%" stopColor={COLORS.rejected[1]} />
                                                </linearGradient>
                                            </defs>
                                            <Pie
                                                data={entriesData}
                                                innerRadius="55%"
                                                outerRadius="80%"
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={8}
                                            >
                                                {entriesData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.status ? `url(#grad${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)})` : '#ccc'} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-parley-brown/30 italic text-sm">Sin datos</div>
                                )}
                            </div>
                        </div>

                        {/* 2. Pie Sólido (Campeonatos) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-parley-gold/10 flex flex-col min-h-[400px] lg:min-h-0 h-full">
                            <h3 className="text-xl font-bold text-parley-brown mb-1">Campeonatos</h3>
                            <p className="text-[10px] text-parley-brown/40 mb-4 font-bold uppercase tracking-wider">Estado Operativo</p>
                            <div className="flex-grow w-full">
                                {championshipsData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={championshipsData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius="85%"
                                                dataKey="value"
                                                stroke="#fff"
                                                strokeWidth={4}
                                            >
                                                {championshipsData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS.championships[index % COLORS.championships.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', background: '#fff' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="rect" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-parley-brown/30 italic text-sm">Sin datos</div>
                                )}
                            </div>
                        </div>

                        {/* 3. Histograma Premium (Top Coleadores) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-parley-gold/10 flex flex-col min-h-[400px] lg:min-h-0 h-full">
                            <h3 className="text-xl font-bold text-parley-brown mb-1">Top Coleadores</h3>
                            <p className="text-[10px] text-parley-brown/40 mb-4 font-bold uppercase tracking-wider">Efectivas Acumuladas</p>
                            <div className="flex-grow w-full">
                                {topColeadoresData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topColeadoresData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                            <defs>
                                                {COLORS.top.map((color, i) => (
                                                    <linearGradient key={i} id={topColeadoresData[i]?.grad} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color.stop1} />
                                                        <stop offset="95%" stopColor={color.stop2} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#2A1B15', fontSize: 11, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2A1B1588', fontSize: 10 }} />
                                            <Tooltip 
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', background: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                                            />
                                            <Bar 
                                                dataKey="puntos" 
                                                radius={[10, 10, 0, 0]} 
                                                barSize={40}
                                            >
                                                {topColeadoresData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#${entry.grad})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-parley-brown/30 italic text-sm">Sin datos</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
