import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
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
            } else {
                setValidationError('Error al validar la combinación. Intente de nuevo.');
            }
        } finally {
            setIsValidating(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.entries.store', championship.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Registrar Cuadro" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <Link 
                            href={route('admin.championships.entries.index', championship.id)}
                            className="text-sm text-parley-brown/50 hover:text-parley-red transition-colors mb-2 inline-block"
                        >
                            &larr; Volver a Cuadros
                        </Link>
                        <h1 className="text-3xl font-bold text-parley-brown">
                            Registro de Cuadro: {championship.name}
                        </h1>
                    </div>

                    {/* Stepper Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-parley-cream/50 -z-10"></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-parley-red text-white' : 'bg-parley-cream/50 text-parley-brown/80'}`}>1</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-parley-red text-white' : 'bg-parley-cream/50 text-parley-brown/80'}`}>2</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-parley-red text-white' : 'bg-parley-cream/50 text-parley-brown/80'}`}>3</div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-parley-brown/60">
                            <span>DATOS DEL CLIENTE</span>
                            <span className="ml-4">DATOS DEL CUADRO</span>
                            <span>DATOS DEL PAGO</span>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
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
                                    <div className="flex justify-end">
                                        <PrimaryButton type="button" onClick={nextStep}>
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
                                        <div className="flex justify-between items-center mb-2">
                                            <InputLabel value="Seleccionar Coleadores" />
                                            <span className="text-sm font-medium text-parley-brown/80">
                                                Seleccionados: {data.coleadores.length} / {championship.coleadores_count}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                                            {championship.coleadores.map((coleador) => {
                                                const isSelected = data.coleadores.includes(coleador.id);
                                                const isDisabled = !isSelected && data.coleadores.length >= championship.coleadores_count;
                                                
                                                return (
                                                    <label
                                                        key={coleador.id}
                                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                                                            isSelected ? 'bg-parley-cream border-parley-red ring-1 ring-parley-red' : 'hover:bg-parley-cream border-parley-gold/30'
                                                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <input                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleColeadorToggle(coleador.id)}
                                                            disabled={isDisabled}
                                                            className="rounded border-parley-gold/50 text-parley-red shadow-sm focus:ring-parley-red"
                                                        />
                                                        <span className="ml-2 text-sm font-medium text-parley-brown truncate">{coleador.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.coleadores || validationError} className="mt-2" />
                                    </div>

                                    <div className="flex justify-between">
                                        <SecondaryButton type="button" onClick={prevStep}>
                                            Anterior
                                        </SecondaryButton>
                                        <PrimaryButton 
                                            type="button" 
                                            onClick={validateCombination} 
                                            disabled={data.coleadores.length !== championship.coleadores_count || !data.entry_name || isValidating}
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

                                    <div className="flex justify-between">
                                        <SecondaryButton type="button" onClick={prevStep}>
                                            Anterior
                                        </SecondaryButton>
                                        <PrimaryButton disabled={processing}>
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
