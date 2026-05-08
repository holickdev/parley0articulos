import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import axios from 'axios';

interface Coleador {
    id: number;
    name: string;
}

interface Championship {
    id: number;
    name: string;
    coleadores_count: number;
    coleadores: Coleador[];
}

interface Props {
    championship: Championship;
}

export default function Create({ championship }: Props) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'error' | 'warning';
    }>({
        show: false,
        title: '',
        message: '',
        type: 'error',
    });

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        phone: '',
        payment_type: '',
        reference: '',
        coleadores: [] as number[],
    });

    const showAlert = (title: string, message: string, type: 'error' | 'warning' = 'error') => {
        setAlertConfig({ show: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertConfig({ ...alertConfig, show: false });
    };

    const handleColeadorToggle = (id: number) => {
        setValidationError(undefined);
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
        
        if (data.coleadores.length !== championship.coleadores_count) {
            setError('coleadores', `Debe seleccionar exactamente ${championship.coleadores_count} coleadores.`);
            return;
        }

        post(route('admin.championships.entries.store', championship.id), {
            onError: (errors) => {
                if (errors.coleadores) {
                    showAlert('Combinación no disponible', errors.coleadores, 'error');
                }
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registrar Cuadro" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Modal show={alertConfig.show} onClose={closeAlert} maxWidth="md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full ${alertConfig.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-parley-gold/20 text-parley-gold'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-parley-brown">{alertConfig.title}</h2>
                            </div>
                            <p className="text-parley-brown/80 mb-6">{alertConfig.message}</p>
                            <div className="flex justify-end">
                                <PrimaryButton onClick={closeAlert}>Entendido</PrimaryButton>
                            </div>
                        </div>
                    </Modal>

                    <div className="mb-8">
                        <Link
                            href={route('admin.championships.entries.index', championship.id)}
                            className="text-sm font-semibold text-parley-gold hover:text-parley-red transition-colors mb-2 inline-flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Volver a Cuadros
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-parley-brown tracking-tight leading-tight">
                            Registro de Cuadro
                            <span className="block text-base sm:text-lg font-medium text-parley-gold mt-1">{championship.name}</span>
                        </h1>
                    </div>

                    <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-parley-gold/10">
                        <form onSubmit={submit} className="p-4 sm:p-8 space-y-8">
                            
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-parley-brown border-b pb-2 italic">1. Información General</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Nombre del Cuadro" />
                                        <TextInput id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full mt-1" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="phone" value="Teléfono de Contacto" />
                                        <TextInput id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full mt-1" />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="payment_type" value="Tipo de Pago" />
                                        <select 
                                            id="payment_type"
                                            value={data.payment_type} 
                                            onChange={e => setData('payment_type', e.target.value as any)}
                                            className="w-full mt-1 border-parley-gold/20 focus:border-parley-red focus:ring-parley-red rounded-xl shadow-sm transition-all"
                                        >
                                            <option value=""></option>
                                            <option value="pago movil">Pago Móvil</option>
                                            <option value="zelle">Zelle</option>
                                            <option value="usdt">USDT</option>
                                        </select>
                                        <InputError message={errors.payment_type} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="reference" value="Referencia" />
                                        <TextInput id="reference" value={data.reference} onChange={e => setData('reference', e.target.value)} className="w-full mt-1" />
                                        <InputError message={errors.reference} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-parley-brown border-b pb-2 italic">2. Selección de Coleadores</h3>
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <InputLabel value="Buscar Coleador" className="mb-1" />
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-parley-gold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                                </div>
                                                <TextInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full" placeholder="Nombre..." />
                                            </div>
                                        </div>
                                        <div className="bg-parley-cream px-4 py-2 rounded-xl border border-parley-gold/20">
                                            <span className="text-sm font-black text-parley-brown/80">
                                                Seleccionados: <span className="text-parley-red">{data.coleadores.length}</span> / {championship.coleadores_count}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar border border-parley-gold/10 rounded-2xl">
                                        {championship.coleadores.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((coleador) => {
                                            const isSelected = data.coleadores.includes(coleador.id);
                                            const isDisabled = !isSelected && data.coleadores.length >= championship.coleadores_count;
                                            return (
                                                <label key={coleador.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-parley-cream border-parley-red ring-4 ring-parley-red/5' : 'bg-white border-parley-gold/10 hover:border-parley-gold/40'} ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-parley-red border-parley-red' : 'border-parley-gold/30'}`}>
                                                        {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>}
                                                    </div>
                                                    <input type="checkbox" checked={isSelected} onChange={() => handleColeadorToggle(coleador.id)} disabled={isDisabled} className="hidden" />
                                                    <span className={`ml-3 text-sm font-bold truncate ${isSelected ? 'text-parley-brown' : 'text-parley-brown/70'}`}>{coleador.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.coleadores || validationError} className="mt-4" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-parley-gold/10">
                                <PrimaryButton disabled={processing} className="w-full sm:w-auto justify-center py-4 px-10">
                                    {processing ? 'Registrando...' : 'Registrar Cuadro'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
