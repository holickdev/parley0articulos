import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

interface Championship {
    id: number;
    name: string;
}

interface Round {
    id: number;
    number: number;
    championship_id: number;
    championship: Championship;
}

export default function Index({ rounds, championships }: { rounds: Round[], championships: Championship[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<Round | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        championship_id: '',
        number: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingRound(null);
        setIsModalOpen(true);
    };

    const openEditModal = (round: Round) => {
        setData({
            championship_id: round.championship_id.toString(),
            number: round.number.toString(),
        });
        clearErrors();
        setEditingRound(round);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingRound) {
            put(route('admin.rounds.update', editingRound.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.rounds.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta ronda?')) {
            destroy(route('admin.rounds.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Rondas
                    </h2>
                    <PrimaryButton onClick={openCreateModal}>
                        Agregar Ronda
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Rondas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Número</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campeonato</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {rounds.map((round) => (
                                        <tr key={round.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">{round.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">Ronda #{round.number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{round.championship.name}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(round)} className="mr-3 text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => handleDelete(round.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
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
                        {editingRound ? 'Editar Ronda' : 'Agregar Nueva Ronda'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="championship_id" value="Campeonato" />
                        <select
                            id="championship_id"
                            value={data.championship_id}
                            onChange={(e) => setData('championship_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        >
                            <option value="">Seleccione un campeonato</option>
                            {championships.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.championship_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="number" value="Número de Ronda" />
                        <TextInput
                            id="number"
                            type="number"
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.number} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {editingRound ? 'Guardar Cambios' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
