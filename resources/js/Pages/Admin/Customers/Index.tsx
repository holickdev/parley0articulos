import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

interface Customer {
    id: number;
    identification: string;
    name: string;
    phone: string;
}

export default function Index({ customers }: { customers: Customer[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        identification: '',
        name: '',
        phone: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setData({
            identification: customer.identification,
            name: customer.name,
            phone: customer.phone,
        });
        clearErrors();
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            put(route('admin.customers.update', editingCustomer.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.customers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            destroy(route('admin.customers.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Clientes
                    </h2>
                    <PrimaryButton onClick={openCreateModal}>
                        Agregar Cliente
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Clientes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Cédula
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Teléfono
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {customer.identification}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {customer.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {customer.phone}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(customer)}
                                                    className="mr-3 text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
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
                        {editingCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="identification" value="Cédula" />
                        <TextInput
                            id="identification"
                            type="text"
                            value={data.identification}
                            onChange={(e) => setData('identification', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                        />
                        <InputError message={errors.identification} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Nombre" />
                        <TextInput
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="phone" value="Teléfono" />
                        <TextInput
                            id="phone"
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {editingCustomer ? 'Guardar Cambios' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
