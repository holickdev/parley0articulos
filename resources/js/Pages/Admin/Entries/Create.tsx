import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

interface Championship {
    id: number;
    name: string;
    coleadores_count: number;
}

interface Customer {
    id: number;
    name: string;
    identification: string;
}

interface Payment {
    id: number;
    reference: string;
    amount_bs: string;
}

interface Coleador {
    id: number;
    name: string;
}

interface Props {
    championships: Championship[];
    customers: Customer[];
    payments: Payment[];
    coleadores: Coleador[];
}

export default function Create({ championships, customers, payments, coleadores }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        championship_id: '',
        customer_id: '',
        payment_id: '',
        name: '',
        status: 'pending',
        coleadores: [] as number[],
    });

    const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);

    useEffect(() => {
        const champ = championships.find(c => c.id === parseInt(data.championship_id));
        setSelectedChampionship(champ || null);
        // Reset coleadores if championship changes
        setData('coleadores', []);
    }, [data.championship_id]);

    const handleColeadorToggle = (id: number) => {
        if (data.coleadores.includes(id)) {
            setData('coleadores', data.coleadores.filter(itemId => itemId !== id));
        } else {
            if (selectedChampionship && data.coleadores.length < selectedChampionship.coleadores_count) {
                setData('coleadores', [...data.coleadores, id]);
            }
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.entries.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Registrar Cuadro Manual
                </h2>
            }
        >
            <Head title="Registrar Cuadro" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="name" value="Nombre del Cuadro" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Ej. Los Amigos"
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="championship_id" value="Campeonato" />
                                        <select
                                            id="championship_id"
                                            value={data.championship_id}
                                            onChange={(e) => setData('championship_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="">Seleccione un campeonato</option>
                                            {championships.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.championship_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="customer_id" value="Cliente" />
                                        <select
                                            id="customer_id"
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="">Seleccione un cliente</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>{c.identification} - {c.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.customer_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="payment_id" value="Referencia de Pago" />
                                        <select
                                            id="payment_id"
                                            value={data.payment_id}
                                            onChange={(e) => setData('payment_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            required
                                        >
                                            <option value="">Seleccione un pago</option>
                                            {payments.map((p) => (
                                                <option key={p.id} value={p.id}>{p.reference} ({p.amount_bs} Bs.)</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.payment_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="status" value="Estado" />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="approved">Aprobado</option>
                                            <option value="rejected">Rechazado</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                {/* Selección de Coleadores */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <InputLabel value="Seleccionar Coleadores" />
                                        {selectedChampionship && (
                                            <span className="text-sm font-medium text-gray-600">
                                                Seleccionados: {data.coleadores.length} / {selectedChampionship.coleadores_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto space-y-2">
                                        {coleadores.map((coleador) => {
                                            const isSelected = data.coleadores.includes(coleador.id);
                                            const isDisabled = !isSelected && selectedChampionship && data.coleadores.length >= selectedChampionship.coleadores_count;
                                            
                                            return (
                                                <label 
                                                    key={coleador.id} 
                                                    className={`flex items-center p-2 rounded border cursor-pointer transition ${
                                                        isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'
                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleColeadorToggle(coleador.id)}
                                                        disabled={isDisabled || !selectedChampionship}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{coleador.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.coleadores} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Link href={route('admin.entries.index')}>
                                    <SecondaryButton>Cancelar</SecondaryButton>
                                </Link>
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Registrar Cuadro
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
