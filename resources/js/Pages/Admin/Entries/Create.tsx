import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
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
    entry_price: string;
    coleadores: Coleador[];
}

interface Props {
    championship: Championship;
}

export default function Create({ championship }: Props) {
    const [step, setStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    // Timer state

    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        // Customer
        customer_identification: '',
        customer_name: '',
        customer_phone: '',
        // Entry
        entry_name: '',
        coleadores: [] as number[],
        // Payment
        payment_bank: '',
        payment_reference: '',
        payment_amount_bs: championship.entry_price,
        payment_date: new Date().toISOString().split('T')[0],
        payment_phone: '',
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

    // Timer logic
    useEffect(() => {
        if (step === 3 && !isTimerActive) {
            setIsTimerActive(true);
            setTimeLeft(600);
        } else if (step < 3 && isTimerActive) {
            setIsTimerActive(false);
        }
    }, [step]);

    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerActive) {
            setIsTimerActive(false);
            showAlert(
                'Tiempo Expirado',
                'El tiempo para completar su registro ha expirado. Por favor, seleccione su cuadro de nuevo para asegurar la disponibilidad.',
                'warning',
                () => {
                    setStep(2);
                    setData('coleadores', []);
                    setTimeLeft(600);
                }
            );
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const validateCombination = async () => {
        if (data.coleadores.length !== championship.coleadores_count) return;

        setIsValidating(true);
        setValidationError(undefined);
        clearErrors('coleadores');

        try {
            await axios.post(route('admin.championships.entries.check', championship.id), {
                coleadores: data.coleadores
            });
            nextStep();
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const msg = error.response.data.errors.coleadores[0];
                setValidationError(msg);
                setError('coleadores', msg);
                showAlert('Cuadro Ocupado', msg, 'error');
            } else {
                setValidationError('Error al validar la combinación. Intente de nuevo.');
                showAlert('Error', 'Error al validar la combinación. Intente de nuevo.');
            }
        } finally {
            setIsValidating(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.entries.store', championship.id), {
            onError: (errors) => {
                if (errors.coleadores) {
                    showAlert(
                        'Combinación no disponible',
                        'Esta combinación de coleadores acaba de ser registrada por otro usuario. Por favor, seleccione una nueva.',
                        'error',
                        () => setStep(2)
                    );
                }
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registrar Cuadro" />

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

                    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-4 sm:px-0">
                        <div>
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
                                Registro de Cuadro
                                <span className="block text-base sm:text-lg font-medium text-parley-gold mt-1">{championship.name}</span>
                            </h1>
                        </div>

                        {step === 3 && isTimerActive && (
                            <div className={`flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all duration-300 w-full sm:w-auto justify-center ${
                                timeLeft < 60 
                                ? 'bg-red-50 border-red-500 text-red-600 animate-pulse shadow-lg shadow-red-200' 
                                : 'bg-parley-cream border-parley-gold text-parley-brown shadow-md shadow-parley-gold/10'
                            }`}>
                                <div className={`${timeLeft < 60 ? 'text-red-600' : 'text-parley-gold'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0 leading-none">
                                    <span className="text-[10px] uppercase tracking-widest opacity-60">Tiempo</span>
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                            <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                                </svg>
                                Se encontraron algunos errores:
                            </div>
                            <ul className="text-sm text-red-600 list-disc list-inside">
                                {Object.values(errors).map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Stepper Header */}
                    <div className="mb-8 overflow-x-hidden">
                        <div className="flex items-center justify-between relative px-2 sm:px-4">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-parley-gold/10 -z-10 rounded-full"></div>
                            <div className="absolute left-0 top-1/2 h-1 bg-parley-red transition-all duration-500 -z-10 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                            
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base sm:text-lg shadow-lg transition-all duration-300 ${
                                        step === s 
                                        ? 'bg-parley-red text-white scale-110 ring-4 ring-parley-red/20' 
                                        : step > s 
                                        ? 'bg-parley-gold text-white' 
                                        : 'bg-white text-parley-brown/30 border-2 border-parley-gold/20'
                                    }`}>
                                        {step > s ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                                            </svg>
                                        ) : s}
                                    </div>
                                    <span className={`mt-3 text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${step >= s ? 'text-parley-brown' : 'text-parley-brown/30'}`}>
                                        {s === 1 ? 'Cliente' : s === 2 ? 'Cuadro' : 'Pago'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white shadow-xl shadow-parley-brown/5 rounded-2xl sm:rounded-3xl overflow-hidden border border-parley-gold/10">
                        <form onSubmit={submit} className="p-4 sm:p-8">

                            {/* Step 1: Customer */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-parley-brown border-b pb-2">Información del Cliente</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="customer_identification" value="Cédula / Identificación" />
                                            <TextInput
                                                id="customer_identification"
                                                type="text"
                                                value={data.customer_identification}
                                                onChange={(e) => setData('customer_identification', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.customer_identification} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="customer_name" value="Nombre Completo" />
                                            <TextInput
                                                id="customer_name"
                                                type="text"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.customer_name} className="mt-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="customer_phone" value="Teléfono" />
                                            <TextInput
                                                id="customer_phone"
                                                type="text"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.customer_phone} className="mt-2" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                                        <PrimaryButton type="button" onClick={nextStep} className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                                            Siguiente: Datos del Cuadro
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Entry */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-parley-brown border-b pb-2">Configuración del Cuadro</h3>
                                    <div>
                                        <InputLabel htmlFor="entry_name" value="Nombre del Cuadro" />
                                        <TextInput
                                            id="entry_name"
                                            type="text"
                                            value={data.entry_name}
                                            onChange={(e) => setData('entry_name', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Ej. Los Intocables"
                                            required
                                        />
                                        <InputError message={errors.entry_name} className="mt-2" />
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
                                            {championship.coleadores
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
                                                        <input                                                            type="checkbox"
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
                                            {championship.coleadores.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
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
                                        <InputError message={errors.coleadores || validationError} className="mt-4" />
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-parley-gold/10">
                                        <SecondaryButton type="button" onClick={prevStep} className="w-full sm:w-auto justify-center py-3 sm:py-2">
                                            Anterior
                                        </SecondaryButton>
                                        <PrimaryButton 
                                            type="button" 
                                            onClick={validateCombination} 
                                            disabled={data.coleadores.length !== championship.coleadores_count || !data.entry_name || isValidating}
                                            className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm"
                                        >
                                            {isValidating ? 'Validando...' : 'Siguiente: Datos de Pago'}
                                        </PrimaryButton>
                                    </div>

                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-parley-brown border-b pb-2">Información del Pago</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="payment_bank" value="Banco" />
                                            <TextInput
                                                id="payment_bank"
                                                type="text"
                                                value={data.payment_bank}
                                                onChange={(e) => setData('payment_bank', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Ej. Banesco"
                                                required
                                            />
                                            <InputError message={errors.payment_bank} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="payment_reference" value="Referencia" />
                                            <TextInput
                                                id="payment_reference"
                                                type="text"
                                                value={data.payment_reference}
                                                onChange={(e) => setData('payment_reference', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.payment_reference} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="payment_amount_bs" value="Monto (Bs.)" />
                                            <TextInput
                                                id="payment_amount_bs"
                                                type="number"
                                                step="0.01"
                                                value={data.payment_amount_bs}
                                                onChange={(e) => setData('payment_amount_bs', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.payment_amount_bs} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="payment_date" value="Fecha de Pago" />
                                            <TextInput
                                                id="payment_date"
                                                type="date"
                                                value={data.payment_date}
                                                onChange={(e) => setData('payment_date', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.payment_date} className="mt-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="payment_phone" value="Teléfono asociado al pago" />
                                            <TextInput
                                                id="payment_phone"
                                                type="text"
                                                value={data.payment_phone}
                                                onChange={(e) => setData('payment_phone', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.payment_phone} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-parley-gold/10">
                                        <SecondaryButton type="button" onClick={prevStep} className="w-full sm:w-auto justify-center py-3 sm:py-2">
                                            Anterior
                                        </SecondaryButton>
                                        <PrimaryButton disabled={processing} className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                                            Finalizar Registro
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
