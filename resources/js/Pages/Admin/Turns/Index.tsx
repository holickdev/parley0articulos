import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

interface Round {
    id: number;
    number: number;
    championship: { name: string };
}

interface Turn {
    id: number;
    number: number;
    round_id: number;
    round: Round;
}

export default function Index({ turns, rounds }: { turns: Turn[], rounds: Round[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTurn, setEditingTurn] = useState<Turn | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        round_id: '',
        number: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingTurn(null);
        setIsModalOpen(true);
    };

    const openEditModal = (turn: Turn) => {
        setData({
            round_id: turn.round_id.toString(),
            number: turn.number.toString(),
        });
        clearErrors();
        setEditingTurn(turn);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingTurn) {
            put(route('admin.turns.update', editingTurn.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.turns.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
            destroy(route('admin.turns.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Turnos
                    </h2>
                    <PrimaryButton onClick={openCreateModal}>
                        Agregar Turno
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Turnos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Número</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ronda</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Campeonato</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {turns.map((turn) => (
                                        <tr key={turn.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">{turn.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">Turno #{turn.number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">Ronda #{turn.round.number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{turn.round.championship.name}</td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(turn)} className="mr-3 text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => handleDelete(turn.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
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
                        {editingTurn ? 'Editar Turno' : 'Agregar Nuevo Turno'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="round_id" value="Ronda" />
                        <select
                            id="round_id"
                            value={data.round_id}
                            onChange={(e) => setData('round_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        >
                            <option value="">Seleccione una ronda</option>
                            {rounds.map((r) => (
                                <option key={r.id} value={r.id}>
                                    Ronda #{r.number} - {r.championship.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.round_id} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="number" value="Número de Turno" />
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
                            {editingTurn ? 'Guardar Cambios' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
