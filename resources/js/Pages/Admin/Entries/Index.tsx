import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { useState } from 'react';
import SecondaryButton from '@/Components/SecondaryButton';

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <Link 
                            href={route('admin.championships.index')}
                            className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 block"
                        >
                            &larr; Volver a Campeonatos
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Cuadros: {championship.name}
                        </h2>
                    </div>
                    <Link href={route('admin.championships.entries.create', championship.id)}>
                        <PrimaryButton>Registrar Cuadro</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={`Cuadros - ${championship.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto pb-24">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cuadro</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Coleadores</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pago Ref.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {entries.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">
                                                No hay cuadros registrados en este campeonato.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 text-sm font-bold text-gray-900">{entry.name}</td>
                                                <td className="px-4 py-4 text-sm">
                                                    <button 
                                                        onClick={() => openModal(entry, 'coleadores')}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                                        title="Ver Coleadores"
                                                    >
                                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span className="text-xs font-medium">{entry.coleadores.length} Coleadores</span>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <button
                                                        onClick={() => openModal(entry, 'customer')}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                    >
                                                        {entry.customer.name}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <button
                                                        onClick={() => openModal(entry, 'payment')}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                    >
                                                        #{entry.payment.reference}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-semibold text-gray-900">{entry.payment.amount_bs} Bs.</td>
                                                <td className="px-4 py-4 text-sm">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[entry.status]}`}>
                                                        {statusLabels[entry.status]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right text-sm font-medium">
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button className="text-gray-400 hover:text-gray-600">
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
                                                                        className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                                                                    >
                                                                        Aprobar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateStatus(entry.id, 'rejected')}
                                                                        className="block w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100"
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
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal show={modalType !== null} onClose={closeModal}>
                <div className="p-6">
                    {modalType === 'coleadores' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
                                Coleadores en "{selectedEntry.name}"
                            </h3>
                            <ul className="space-y-2">
                                {selectedEntry.coleadores.map((coleador, idx) => (
                                    <li key={coleador.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-xs">
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-800 font-medium">{coleador.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {modalType === 'customer' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
                                Datos del Cliente
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Nombre</p>
                                    <p className="text-gray-900 font-medium">{selectedEntry.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Identificación / Cédula</p>
                                    <p className="text-gray-900 font-medium">{selectedEntry.customer.identification}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Teléfono</p>
                                    <p className="text-gray-900 font-medium">{selectedEntry.customer.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalType === 'payment' && selectedEntry && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
                                Detalle del Pago
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Referencia</p>
                                    <p className="text-lg font-bold text-indigo-600">{selectedEntry.payment.reference}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Banco</p>
                                    <p className="text-gray-900 font-medium">{selectedEntry.payment.bank}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Monto</p>
                                    <p className="text-gray-900 font-bold">{selectedEntry.payment.amount_bs} Bs.</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Fecha</p>
                                    <p className="text-gray-900 font-medium">{formatDate(selectedEntry.payment.payment_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Teléfono Pago</p>
                                    <p className="text-gray-900 font-medium">{selectedEntry.payment.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cerrar</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
