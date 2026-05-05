import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
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

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        identification: '',
        bank: '',
        phone: '',
        reference: '',
        amount_bs: '',
        payment_date: '',
    });

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
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Pagos
                    </h2>
                    <PrimaryButton onClick={openCreateModal}>
                        Registrar Pago
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Pagos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cédula</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Banco</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">{payment.reference}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">{payment.identification}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">{payment.bank}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-gray-900">{payment.amount_bs} Bs.</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(payment)} className="mr-3 text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
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
