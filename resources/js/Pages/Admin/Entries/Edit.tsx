import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
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

interface Coleador {
    id: number;
    name: string;
}

interface Entry {
    id: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    coleadores: Coleador[];
}

interface Props {
    championship: Championship;
    entry: Entry;
    coleadores: Coleador[];
}

export default function Edit({ championship, entry, coleadores }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: entry.name,
        status: entry.status,
        coleadores: entry.coleadores.map(c => c.id),
    });

    const handleColeadorToggle = (id: number) => {
        if (data.coleadores.includes(id)) {
            setData('coleadores', data.coleadores.filter(itemId => itemId !== id));
        } else {
            if (data.coleadores.length < championship.coleadores_count) {
                setData('coleadores', [...data.coleadores, id]);
            }
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.championships.entries.update', [championship.id, entry.id]));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar Cuadro - ${entry.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link 
                            href={route('admin.championships.entries.index', championship.id)}
                            className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                        >
                            &larr; Volver a Cuadros
                        </Link>
                        <h1 className="text-3xl font-bold text-parley-brown">
                            Editar Cuadro: {entry.name}
                        </h1>
                    </div>

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
                                            required
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
                                            <option value="pending">Pendiente</option>
                                            <option value="approved">Aprobado</option>
                                            <option value="rejected">Rechazado</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    
                                    <div className="bg-parley-cream p-4 rounded-md">
                                        <h4 className="text-sm font-bold text-parley-brown mb-2">Información del Campeonato</h4>
                                        <p className="text-sm text-parley-brown/80">Nombre: {championship.name}</p>
                                        <p className="text-sm text-parley-brown/80">Coleadores por cuadro: {championship.coleadores_count}</p>
                                    </div>
                                </div>

                                {/* Selección de Coleadores */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <InputLabel value="Seleccionar Coleadores" />
                                        <span className="text-sm font-medium text-parley-brown/80">
                                            Seleccionados: {data.coleadores.length} / {championship.coleadores_count}
                                        </span>
                                    </div>
                                    <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto space-y-2">
                                        {coleadores.map((coleador) => {
                                            const isSelected = data.coleadores.includes(coleador.id);
                                            const isDisabled = !isSelected && data.coleadores.length >= championship.coleadores_count;
                                            
                                            return (
                                                <label
                                                    key={coleador.id}
                                                    className={`flex items-center p-2 rounded border cursor-pointer transition ${
                                                        isSelected ? 'bg-parley-cream border-parley-gold/40' : 'hover:bg-parley-cream'
                                                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleColeadorToggle(coleador.id)}
                                                        disabled={isDisabled}
                                                        className="rounded border-parley-gold/50 text-parley-red shadow-sm focus:ring-parley-red"
                                                    />
                                                    <span className="ml-2 text-sm text-parley-brown">{coleador.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.coleadores} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Link href={route('admin.championships.entries.index', championship.id)}>
                                    <SecondaryButton>Cancelar</SecondaryButton>
                                </Link>
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Guardar Cambios
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
