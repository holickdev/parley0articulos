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
    // Colores de alto contraste para Campeonatos
    championships: ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b'],
    // Colores para el Histograma Top
    top: [
        { stop1: '#fcd34d', stop2: '#fbbf24' }, // Gold
        { stop1: '#e2e8f0', stop2: '#94a3b8' }, // Silver
        { stop1: '#d97706', stop2: '#b45309' }, // Bronze
    ],
};

const entriesData = [
    { name: 'Aprobados', value: 45 },
    { name: 'Pendientes', value: 12 },
    { name: 'Rechazados', value: 5 },
];

const championshipsData = [
    { name: 'Abiertos', value: 8 },
    { name: 'En Progreso', value: 12 },
    { name: 'Finalizados', value: 15 },
    { name: 'Otros', value: 3 },
];

const topColeadoresData = [
    { name: 'Juan Pérez', puntos: 85, grad: 'gradGold' },
    { name: 'Carlos Ruiz', puntos: 72, grad: 'gradSilver' },
    { name: 'Pedro Gómez', puntos: 68, grad: 'gradBronze' },
];

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Admin" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-parley-red tracking-tight italic">
                            ADMIN <span className="text-gray-900">PARLEY 0 ARTÍCULOS</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* 1. Dona (Estatus de Cuadros) */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Estatus de Cuadros</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider text-xs">Validación</p>
                            <div className="h-[380px] w-full">
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
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={8}
                                        >
                                            <Cell fill="url(#gradApproved)" />
                                            <Cell fill="url(#gradPending)" />
                                            <Cell fill="url(#gradRejected)" />
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={40} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. Pie Sólido (Campeonatos - Colores Claros) */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Campeonatos</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider text-xs">Estado Operativo</p>
                            <div className="h-[380px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={championshipsData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={115}
                                            dataKey="value"
                                            stroke="#fff"
                                            strokeWidth={4}
                                        >
                                            {championshipsData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.championships[index % COLORS.championships.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                                        <Legend verticalAlign="bottom" height={40} iconType="rect" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 3. Histograma Premium (Top Coleadores) */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transition-all hover:shadow-xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">Top Coleadores</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider text-xs">Puntos Acumulados</p>
                            <div className="h-[380px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topColeadoresData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            {COLORS.top.map((color, i) => (
                                                <linearGradient key={i} id={topColeadoresData[i].grad} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={color.stop1} />
                                                    <stop offset="95%" stopColor={color.stop2} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                                        />
                                        <Bar 
                                            dataKey="puntos" 
                                            radius={[12, 12, 0, 0]} 
                                            barSize={50}
                                        >
                                            {topColeadoresData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#${entry.grad})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
