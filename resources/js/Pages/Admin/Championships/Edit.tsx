import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Toggle from '@/Components/Toggle';
import Dropdown from '@/Components/Dropdown';
import Modal from '@/Components/Modal';

interface Coleador {
    id: number;
    name: string;
}

interface Championship {
    id: number;
    name: string;
    coleadores_count: number;
    rounds_count: number;
    entry_price: string;
    status: 'open' | 'in_progress' | 'finished';
    has_articles: boolean;
    coleadores: Coleador[];
}

export default function Edit({ championship }: { championship: Championship }) {
    const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: championship.name,
        coleadores_count: championship.coleadores_count,
        rounds_count: championship.rounds_count,
        entry_price: championship.entry_price,
        status: championship.status,
        has_articles: championship.has_articles,
        coleadores: championship.coleadores.map(c => c.name),
    });

    const [rawNames, setRawNames] = useState(championship.coleadores.map(c => c.name).join('\n'));
    const [singleName, setSingleName] = useState('');

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
        put(route('admin.championships.update', championship.id));
    };

    const deleteChampionship = () => {
        router.delete(route('admin.championships.destroy', championship.id), {
            onFinish: () => setIsConfirmingDeletion(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Editar Campeonato" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <Link
                                href={route('admin.championships.index')}
                                className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                            >
                                &larr; Volver a Campeonatos
                            </Link>
                            <h1 className="text-3xl font-bold text-parley-brown">
                                Configuración: {championship.name}
                            </h1>
                        </div>
                        
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="p-2 text-parley-brown/40 hover:text-parley-red transition-colors bg-white rounded-full shadow-sm border border-parley-gold/20">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button
                                    onClick={() => setIsConfirmingDeletion(true)}
                                    className="block w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Eliminar Campeonato
                                </button>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Resto del formulario igual... */}                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-medium text-parley-brown mb-4">Información General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre del Evento" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Estado" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="mt-1 block w-full border-parley-gold/50 focus:border-parley-red focus:ring-parley-red rounded-md shadow-sm"
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
                                    <InputError message={errors.rounds_count} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="entry_price" value="Precio del Cuadro ($)" />
                                    <TextInput
                                        id="entry_price"
                                        type="number"
                                        step="0.01"
                                        value={data.entry_price}
                                        onChange={(e) => setData('entry_price', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.entry_price} className="mt-2" />
                                </div>

                                <div className="mt-6">
                                    <Toggle
                                        checked={data.has_articles}
                                        onChange={(checked) => setData('has_articles', checked)}
                                        label="Habilitar Artículos / Restas"
                                        description="Permite ingresar penalizaciones (AR) en las puntuaciones."
                                    />
                                    <InputError message={errors.has_articles} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-medium text-parley-brown mb-2">Coleadores Participantes</h3>
                            <p className="text-sm text-parley-brown/60 mb-4">Ingresa los nombres de los coleadores, uno por línea.</p>
                            
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
                                        className="mt-1 block w-full border-parley-gold/50 focus:border-parley-red focus:ring-parley-red rounded-md shadow-sm"
                                        rows={10}
                                        placeholder="Coleador 1&#10;Coleador 2&#10;Coleador 3..."
                                    ></textarea>
                                    <p className="mt-1 text-xs text-parley-brown/80">
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
                                Actualizar Campeonato
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={isConfirmingDeletion} onClose={() => setIsConfirmingDeletion(false)} maxWidth="md">
                <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 mx-auto">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-2xl font-black text-center text-parley-brown mb-2">
                        ¿Eliminar este Campeonato?
                    </h3>
                    
                    <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                        Esta acción es <span className="text-red-600 font-bold uppercase underline">irreversible</span>. Se perderán todos los cuadros registrados, puntuaciones, rondas y coleadores asociados a <span className="font-bold text-parley-brown">"{championship.name}"</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <SecondaryButton onClick={() => setIsConfirmingDeletion(false)} className="py-3 px-8 justify-center">
                            No, mantener campeonato
                        </SecondaryButton>
                        <DangerButton onClick={deleteChampionship} className="py-3 px-8 justify-center">
                            Sí, eliminar permanentemente
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
