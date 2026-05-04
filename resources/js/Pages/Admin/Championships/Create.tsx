import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        coleadores_count: 4,
        rounds_count: 4,
        entry_price: '',
        status: 'open',
        coleadores: [] as string[],
    });

    const [rawNames, setRawNames] = useState('');
    const [singleName, setSingleName] = useState('');

    // Sincronizar el textarea con el array de coleadores
    useEffect(() => {
        const names = rawNames
            .split('\n')
            .map(n => n.trim())
            .filter(n => n !== '');
        setData('coleadores', names);
    }, [rawNames]);

    const addSingleName = () => {
        if (singleName.trim()) {
            setRawNames(prev => prev ? `${prev}\n${singleName.trim()}` : singleName.trim());
            setSingleName('');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Crear Campeonato
                </h2>
            }
        >
            <Head title="Crear Campeonato" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre del Evento" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Ej. Campeonato Nacional 2026"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Estado Inicial" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="open">Abierto (Registro de cuadros)</option>
                                        <option value="in_progress">En Curso (Competencia)</option>
                                        <option value="finished">Finalizado</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="coleadores_count" value="Coleadores por Cuadro" />
                                    <TextInput
                                        id="coleadores_count"
                                        type="number"
                                        value={data.coleadores_count.toString()}
                                        onChange={(e) => setData('coleadores_count', parseInt(e.target.value))}
                                        className="mt-1 block w-full"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Cuántos coleadores debe elegir el cliente.</p>
                                    <InputError message={errors.coleadores_count} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="rounds_count" value="Número de Rondas" />
                                    <TextInput
                                        id="rounds_count"
                                        type="number"
                                        value={data.rounds_count.toString()}
                                        onChange={(e) => setData('rounds_count', parseInt(e.target.value))}
                                        className="mt-1 block w-full"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Cuántas columnas de puntuación tendrá el campeonato.</p>
                                    <InputError message={errors.rounds_count} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="entry_price" value="Precio del Cuadro (Bs.)" />
                                    <TextInput
                                        id="entry_price"
                                        type="number"
                                        step="0.01"
                                        value={data.entry_price}
                                        onChange={(e) => setData('entry_price', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.entry_price} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Coleadores Participantes</h3>
                            <p className="text-sm text-gray-500 mb-4">Ingresa los nombres de los coleadores, uno por línea.</p>
                            
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <TextInput
                                            value={singleName}
                                            onChange={(e) => setSingleName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSingleName())}
                                            className="w-full"
                                            placeholder="Nombre del coleador..."
                                        />
                                    </div>
                                    <SecondaryButton type="button" onClick={addSingleName}>
                                        Agregar
                                    </SecondaryButton>
                                </div>

                                <div>
                                    <InputLabel htmlFor="coleadores_raw" value="Lista de Coleadores (Raw Data)" />
                                    <textarea
                                        id="coleadores_raw"
                                        value={rawNames}
                                        onChange={(e) => setRawNames(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows={10}
                                        placeholder="Coleador 1&#10;Coleador 2&#10;Coleador 3..."
                                    ></textarea>
                                    <p className="mt-1 text-xs text-gray-600">
                                        {data.coleadores.length} coleadores detectados.
                                    </p>
                                    <InputError message={errors.coleadores} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Link href={route('admin.championships.index')}>
                                <SecondaryButton>Cancelar</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing}>
                                Crear Campeonato
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
