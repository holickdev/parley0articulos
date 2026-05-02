import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

interface Coleador {
    id: number;
    name: string;
}

export default function Create({ coleadores }: { coleadores: Coleador[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        coleadores_count: 4,
        rounds_count: 4,
        entry_price: '',
        status: 'open',
        coleadores: [] as number[],
    });

    const toggleColeador = (id: number) => {
        const current = [...data.coleadores];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setData('coleadores', current);
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
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Coleadores Participantes</h3>
                                    <p className="text-sm text-gray-500">Selecciona los coleadores que estarán disponibles en este campeonato.</p>
                                </div>
                                <div className="text-sm font-semibold text-indigo-600">
                                    {data.coleadores.length} seleccionados
                                </div>
                            </div>
                            
                            <InputError message={errors.coleadores} className="mb-4" />

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {coleadores.map((coleador) => (
                                    <div
                                        key={coleador.id}
                                        onClick={() => toggleColeador(coleador.id)}
                                        className={`cursor-pointer p-3 text-center border rounded-md transition-colors ${
                                            data.coleadores.includes(coleador.id)
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="text-xs truncate">{coleador.name}</div>
                                    </div>
                                ))}
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
