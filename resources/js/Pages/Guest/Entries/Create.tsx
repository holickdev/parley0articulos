import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
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
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
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
        customer_identification: '',
        customer_name: '',
        customer_phone: '',
        entry_name: '',
        coleadores: [] as number[],
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
        if (alertConfig.action) alertConfig.action();
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
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
            await axios.post(route('public.entries.check', championship.id), {
                coleadores: data.coleadores
            });
            setStep(3);
        } catch (error: any) {
            if (error.response?.data?.errors?.coleadores) {
                const msg = error.response.data.errors.coleadores[0];
                setValidationError(msg);
                setError('coleadores', msg);
                showAlert('Cuadro Ocupado', msg, 'error');
            } else {
                showAlert('Error', 'Error al validar la combinación. Intente de nuevo.');
            }
        } finally {
            setIsValidating(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('public.entries.store', championship.id), {
            onError: (errors) => {
                if (errors.coleadores) {
                    showAlert('Combinación no disponible', 'Esta combinación acaba de ser registrada. Por favor, seleccione una nueva.', 'error', () => setStep(2));
                }
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Registrar Cuadro" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Alert Modal */}
                    <Modal show={alertConfig.show} onClose={closeAlert} maxWidth="md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full ${alertConfig.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-parley-gold/20 text-parley-gold'}`}>
                                    {alertConfig.type === 'error' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-parley-brown">{alertConfig.title}</h2>
                            </div>
                            <p className="text-parley-brown/80 mb-6">{alertConfig.message}</p>
                            <div className="flex justify-end"><PrimaryButton onClick={closeAlert}>Entendido</PrimaryButton></div>
                        </div>
                    </Modal>

                    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-4 sm:px-0">
                        <div>
                            <Link href={route('public.entries', championship.id)} className="text-sm font-semibold text-parley-gold hover:text-parley-red mb-2 inline-flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                                Volver a Clasificación
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-black text-parley-brown tracking-tight leading-tight">
                                Inscripción de Cuadro
                                <span className="block text-base sm:text-lg font-medium text-parley-gold mt-1">{championship.name}</span>
                            </h1>
                        </div>

                        {step === 3 && isTimerActive && (
                            <div className={`flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all duration-300 w-full sm:w-auto justify-center ${
                                timeLeft < 60 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-parley-cream border-parley-gold text-parley-brown shadow-md'
                            }`}>
                                <div className={`${timeLeft < 60 ? 'text-red-600' : 'text-parley-gold'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0 leading-none text-center">
                                    <span className="text-[10px] uppercase tracking-widest opacity-60">Tiempo restante para realizar el pago</span>
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stepper Header */}
                    <div className="mb-8 overflow-x-hidden">
                        <div className="flex items-center justify-between relative px-2 sm:px-4">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-parley-gold/10 -z-10 rounded-full"></div>
                            <div className="absolute left-0 top-1/2 h-1 bg-parley-red transition-all duration-500 -z-10 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base shadow-lg transition-all duration-300 ${
                                        step === s ? 'bg-parley-red text-white scale-110 ring-4 ring-parley-red/20' : step > s ? 'bg-parley-gold text-white' : 'bg-white text-parley-brown/30 border-2 border-parley-gold/20'
                                    }`}>
                                        {step > s ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" /></svg>
                                        ) : s}
                                    </div>
                                    <span className={`mt-3 text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${step >= s ? 'text-parley-brown' : 'text-parley-brown/30'}`}>
                                        {s === 1 ? 'Cliente' : s === 2 ? 'Cuadro' : 'Pago'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-parley-gold/10">
                        <form onSubmit={submit} className="p-4 sm:p-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-parley-brown border-b pb-2">Información del Cliente</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><InputLabel value="Cédula / Identificación" /><TextInput value={data.customer_identification} onChange={e => setData('customer_identification', e.target.value)} className="w-full mt-1" required /><InputError message={errors.customer_identification} /></div>
                                        <div><InputLabel value="Nombre Completo" /><TextInput value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} className="w-full mt-1" required /><InputError message={errors.customer_name} /></div>
                                        <div className="md:col-span-2"><InputLabel value="Teléfono" /><TextInput value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)} className="w-full mt-1" required /><InputError message={errors.customer_phone} /></div>
                                    </div>
                                    <div className="flex justify-end pt-4"><PrimaryButton type="button" onClick={() => setStep(2)} className="w-full sm:w-auto">Siguiente: Datos del Cuadro</PrimaryButton></div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-parley-brown border-b pb-2">Configuración del Cuadro</h3>
                                    <div><InputLabel value="Nombre del Cuadro" /><TextInput value={data.entry_name} onChange={e => setData('entry_name', e.target.value)} placeholder="Ej. Los Intocables" className="w-full mt-1" required /><InputError message={errors.entry_name} /></div>

                                    <div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <InputLabel value="Buscar Coleador" className="mb-1" />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-parley-gold"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg></div>
                                                    <TextInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full border-parley-gold/30" placeholder="Nombre del coleador..." />
                                                </div>
                                            </div>
                                            <div className="bg-parley-cream px-4 py-2 rounded-xl border border-parley-gold/20 self-end"><span className="text-sm font-black text-parley-brown/80">Seleccionados: <span className="text-parley-red">{data.coleadores.length}</span> / {championship.coleadores_count}</span></div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                                            {championship.coleadores.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((coleador) => {
                                                const isSelected = data.coleadores.includes(coleador.id);
                                                const isDisabled = !isSelected && data.coleadores.length >= championship.coleadores_count;
                                                return (
                                                    <label key={coleador.id} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-parley-cream border-parley-red ring-4 ring-parley-red/5' : 'bg-white border-parley-gold/10 hover:border-parley-gold/40'} ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-parley-red border-parley-red' : 'border-parley-gold/30'}`}>{isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>}</div>
                                                        <input type="checkbox" checked={isSelected} onChange={() => handleColeadorToggle(coleador.id)} disabled={isDisabled} className="hidden" />
                                                        <span className={`ml-3 text-sm font-bold truncate ${isSelected ? 'text-parley-brown' : 'text-parley-brown/70'}`}>{coleador.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.coleadores || validationError} className="mt-4" />
                                    </div>

                                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-parley-gold/10">
                                        <SecondaryButton type="button" onClick={() => setStep(1)} className="w-full sm:w-auto">Anterior</SecondaryButton>
                                        <PrimaryButton type="button" onClick={validateCombination} disabled={data.coleadores.length !== championship.coleadores_count || !data.entry_name || isValidating} className="w-full sm:w-auto">{isValidating ? 'Validando...' : 'Siguiente'}</PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-parley-brown border-b pb-2">Información del Pago</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><InputLabel value="Banco" /><TextInput value={data.payment_bank} onChange={e => setData('payment_bank', e.target.value)} className="w-full mt-1" required /><InputError message={errors.payment_bank} /></div>
                                        <div><InputLabel value="Referencia" /><TextInput value={data.payment_reference} onChange={e => setData('payment_reference', e.target.value)} className="w-full mt-1" required /><InputError message={errors.payment_reference} /></div>
                                        <div><InputLabel value="Monto (Bs.)" /><TextInput value={data.payment_amount_bs} onChange={e => setData('payment_amount_bs', e.target.value)} className="w-full mt-1" required /><InputError message={errors.payment_amount_bs} /></div>
                                        <div><InputLabel value="Fecha de Pago" /><TextInput type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} className="w-full mt-1" required /><InputError message={errors.payment_date} /></div>
                                        <div className="md:col-span-2"><InputLabel value="Teléfono asociado al pago" /><TextInput value={data.payment_phone} onChange={e => setData('payment_phone', e.target.value)} className="w-full mt-1" required /><InputError message={errors.payment_phone} /></div>
                                    </div>
                                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-parley-gold/10">
                                        <SecondaryButton type="button" onClick={() => setStep(2)} className="w-full sm:w-auto">Anterior</SecondaryButton>
                                        <PrimaryButton disabled={processing} className="w-full sm:w-auto">Finalizar Registro</PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
