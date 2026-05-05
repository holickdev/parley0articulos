import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useMemo } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

interface Payment {
    id: number;
    identification: string;
    bank: string;
    phone: string;
    reference: string;
    amount_bs: string;
    payment_date: string;
}

export default function Index({ payments }: { payments: Payment[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    // DataTable States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState<keyof Payment>('payment_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        identification: '',
        bank: '',
        phone: '',
        reference: '',
        amount_bs: '',
        payment_date: '',
    });

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

    const filteredPayments = useMemo(() => {
        return payments
            .filter(payment =>
                payment.reference.toLowerCase().includes(search.toLowerCase()) ||
                payment.identification.toLowerCase().includes(search.toLowerCase()) ||
                payment.bank.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                
                if (sortBy === 'amount_bs') {
                    valA = parseFloat(valA as string);
                    valB = parseFloat(valB as string);
                } else {
                    valA = (valA as string).toLowerCase();
                    valB = (valB as string).toLowerCase();
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [payments, search, sortBy, sortDirection]);

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSort = (column: keyof Payment) => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingPayment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (payment: Payment) => {
        setData({
            identification: payment.identification,
            bank: payment.bank,
            phone: payment.phone,
            reference: payment.reference,
            amount_bs: payment.amount_bs,
            payment_date: payment.payment_date.split('T')[0],
        });
        clearErrors();
        setEditingPayment(payment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingPayment) {
            put(route('admin.payments.update', editingPayment.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.payments.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este pago?')) {
            destroy(route('admin.payments.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pagos" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-parley-brown leading-tight">
                                Pagos
                            </h1>
                        </div>
                        <PrimaryButton onClick={openCreateModal} className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                            Registrar Pago <span className="ml-2 text-lg">+</span>
                        </PrimaryButton>
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
                                placeholder="Buscar por referencia, cédula o banco..."
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-parley-gold/20">
                                <thead className="bg-parley-cream">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('reference')}>
                                            <div className="flex items-center gap-1">
                                                Ref.
                                                {sortBy === 'reference' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('identification')}>
                                            <div className="flex items-center gap-1">
                                                Cédula
                                                {sortBy === 'identification' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('bank')}>
                                            <div className="flex items-center gap-1">
                                                Banco
                                                {sortBy === 'bank' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('amount_bs')}>
                                            <div className="flex items-center gap-1">
                                                Monto
                                                {sortBy === 'amount_bs' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors" onClick={() => toggleSort('payment_date')}>
                                            <div className="flex items-center gap-1">
                                                Fecha
                                                {sortBy === 'payment_date' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-parley-brown/60">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-parley-cream/30 transition-colors">
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-parley-brown">{payment.reference}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-parley-brown/80">{payment.identification}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-parley-brown/80">{payment.bank}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-parley-brown">{formatBs(payment.amount_bs)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-parley-brown/60">{formatDate(payment.payment_date)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium space-x-3">
                                                <button onClick={() => openEditModal(payment)} className="text-parley-red hover:underline font-bold">Editar</button>
                                                <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:underline font-bold">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedPayments.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-parley-brown/40 italic">
                                                No se encontraron registros de pagos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="bg-parley-cream p-4 border-t border-parley-gold/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-parley-brown/80 font-medium">
                                Mostrando <span className="text-parley-brown font-bold">{paginatedPayments.length}</span> de <span className="text-parley-brown font-bold">{filteredPayments.length}</span> registros
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

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-parley-brown">
                        {editingPayment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <InputLabel htmlFor="reference" value="Referencia" />
                            <TextInput id="reference" type="text" value={data.reference} onChange={(e) => setData('reference', e.target.value)} className="mt-1 block w-full" isFocused />
                            <InputError message={errors.reference} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="amount_bs" value="Monto (Bs.)" />
                            <TextInput id="amount_bs" type="number" step="0.01" value={data.amount_bs} onChange={(e) => setData('amount_bs', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.amount_bs} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="identification" value="Cédula" />
                            <TextInput id="identification" type="text" value={data.identification} onChange={(e) => setData('identification', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.identification} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="bank" value="Banco" />
                            <TextInput id="bank" type="text" value={data.bank} onChange={(e) => setData('bank', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.bank} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="phone" value="Teléfono" />
                            <TextInput id="phone" type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment_date" value="Fecha de Pago" />
                            <TextInput id="payment_date" type="date" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} className="mt-1 block w-full" />
                            <InputError message={errors.payment_date} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {editingPayment ? 'Guardar Cambios' : 'Registrar'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
