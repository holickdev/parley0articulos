import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

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
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state for alerts
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'error' | 'warning';
        action?: () => void;
    }>({
        show: false,
        title: '',
        message: '',
        type: 'error',
    });

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: entry.name,
        status: entry.status,
        coleadores: entry.coleadores.map(c => c.id),
    });

    const showAlert = (title: string, message: string, type: 'error' | 'warning' = 'error', action?: () => void) => {
        setAlertConfig({ show: true, title, message, type, action });
    };

    const closeAlert = () => {
        if (alertConfig.action) {
            alertConfig.action();
        }
        setAlertConfig({ ...alertConfig, show: false });
    };

    const handleColeadorToggle = (id: number) => {
        clearErrors('coleadores');
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
        put(route('admin.championships.entries.update', [championship.id, entry.id]), {
            onError: (errors) => {
                if (errors.coleadores) {
                    showAlert(
                        'Combinación no disponible',
                        'Esta combinación de coleadores ya se encuentra registrada en este campeonato. Por favor, seleccione una nueva.',
                        'error'
                    );
                }
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar Cuadro - ${entry.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Alert Modal */}
                    <Modal show={alertConfig.show} onClose={closeAlert} maxWidth="md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full ${alertConfig.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-parley-gold/20 text-parley-gold'}`}>
                                    {alertConfig.type === 'error' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-parley-brown">{alertConfig.title}</h2>
                            </div>
                            <p className="text-parley-brown/80 mb-6 leading-relaxed">
                                {alertConfig.message}
                            </p>
                            <div className="flex justify-end">
                                <PrimaryButton onClick={closeAlert} className="px-8">
                                    Entendido
                                </PrimaryButton>
                            </div>
                        </div>
                    </Modal>

                    <div className="mb-8 px-4 sm:px-0">
                        <Link 
                            href={route('admin.championships.entries.index', championship.id)}
                            className="text-sm font-semibold text-parley-gold hover:text-parley-red transition-colors mb-2 inline-block flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Volver a Cuadros
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-parley-brown tracking-tight leading-tight">
                            Editar Cuadro
                            <span className="block text-base sm:text-lg font-medium text-parley-gold mt-1">{entry.name}</span>
                        </h1>
                    </div>

                    <div className="bg-white shadow-xl shadow-parley-brown/5 rounded-2xl sm:rounded-3xl overflow-hidden border border-parley-gold/10">
                        <form onSubmit={submit} className="p-4 sm:p-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-parley-brown border-b pb-2">Configuración del Cuadro</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            className="mt-1 block w-full border-parley-gold/50 focus:border-parley-red focus:ring-parley-red rounded-md shadow-sm h-[42px]"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="approved">Aprobado</option>
                                            <option value="rejected">Rechazado</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <InputLabel value="Buscar Coleador" className="mb-1" />
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-parley-gold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                                    </svg>
                                                </div>
                                                <TextInput
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 block w-full border-parley-gold/30 focus:border-parley-gold focus:ring-parley-gold/20"
                                                    placeholder="Nombre del coleador..."
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-parley-cream px-4 py-2 rounded-xl border border-parley-gold/20 shadow-sm self-end">
                                            <span className="text-sm font-black text-parley-brown/80">
                                                Seleccionados: <span className="text-parley-red">{data.coleadores.length}</span> / {championship.coleadores_count}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 pr-2 custom-scrollbar">
                                        {coleadores
                                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((coleador) => {
                                            const isSelected = data.coleadores.includes(coleador.id);
                                            const isDisabled = !isSelected && data.coleadores.length >= championship.coleadores_count;

                                            return (
                                                <label
                                                    key={coleador.id}
                                                    className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                                                        isSelected 
                                                        ? 'bg-parley-cream border-parley-red ring-4 ring-parley-red/5' 
                                                        : 'bg-white border-parley-gold/10 hover:border-parley-gold/40 hover:bg-parley-cream/30 shadow-sm'
                                                    } ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                                        isSelected ? 'bg-parley-red border-parley-red' : 'border-parley-gold/30 group-hover:border-parley-gold'
                                                    }`}>
                                                        {isSelected && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleColeadorToggle(coleador.id)}
                                                        disabled={isDisabled}
                                                        className="hidden"
                                                    />
                                                    <span className={`ml-3 text-sm font-bold truncate ${isSelected ? 'text-parley-brown' : 'text-parley-brown/70'}`}>
                                                        {coleador.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                        {coleadores.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                            <div className="col-span-full py-12 text-center bg-parley-cream/30 rounded-3xl border-2 border-dashed border-parley-gold/20">
                                                <div className="text-parley-gold/40 mb-2 flex justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                </div>
                                                <p className="text-parley-brown/50 font-medium">No se encontraron coleadores con ese nombre.</p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.coleadores} className="mt-4" />
                                </div>

                                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-parley-gold/10">
                                    <Link href={route('admin.championships.entries.index', championship.id)}>
                                        <SecondaryButton type="button" className="px-6">Cancelar</SecondaryButton>
                                    </Link>
                                    <PrimaryButton className="px-8" disabled={processing}>
                                        Guardar Cambios
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
