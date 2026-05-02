import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

interface Entry {
    id: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    championship: { name: string };
    customer: { name: string, identification: string };
    payment: { reference: string, amount_bs: string };
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

export default function Index({ entries }: { entries: Entry[] }) {
    const updateStatus = (id: number, status: string) => {
        if (confirm(`¿Marcar este cuadro como ${status === 'approved' ? 'APROBADO' : 'RECHAZADO'}?`)) {
            router.put(route('admin.entries.update', id), { status });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Auditoría de Cuadros
                    </h2>
                    <Link href={route('admin.entries.create')}>
                        <PrimaryButton>Registrar Cuadro Manual</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Cuadros" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cuadro</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campeonato</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pago Ref.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm text-gray-500">{entry.id}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900">{entry.name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{entry.championship.name}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{entry.customer.name}</div>
                                                <div className="text-gray-500">{entry.customer.identification}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{entry.payment.reference}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">{entry.payment.amount_bs} Bs.</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[entry.status]}`}>
                                                    {statusLabels[entry.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm font-medium space-x-2">
                                                {entry.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(entry.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(entry.id, 'rejected')}
                                                            className="text-orange-600 hover:text-orange-900"
                                                        >
                                                            Rechazar
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={route('admin.entries.edit', entry.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Editar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
