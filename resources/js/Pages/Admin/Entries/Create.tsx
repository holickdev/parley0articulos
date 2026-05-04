import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

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

    const { data, setData, post, processing, errors } = useForm({
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
        if (data.coleadores.includes(id)) {
            setData('coleadores', data.coleadores.filter(itemId => itemId !== id));
        } else {
            if (data.coleadores.length < championship.coleadores_count) {
                setData('coleadores', [...data.coleadores, id]);
            }
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.championships.entries.store', championship.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Link 
                        href={route('admin.championships.entries.index', championship.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 block"
                    >
                        &larr; Volver a Cuadros
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Registro de Cuadro: {championship.name}
                    </h2>
                </div>
            }
        >
            <Head title="Registrar Cuadro" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Stepper Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
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
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Cliente</h3>
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
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Configuración del Cuadro</h3>
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
                                            <span className="text-sm font-medium text-gray-600">
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
                                                            isSelected ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400' : 'hover:bg-gray-50 border-gray-200'
                                                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleColeadorToggle(coleador.id)}
                                                            disabled={isDisabled}
                                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                        />
                                                        <span className="ml-2 text-sm font-medium text-gray-700 truncate">{coleador.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.coleadores} className="mt-2" />
                                    </div>

                                    <div className="flex justify-between">
                                        <SecondaryButton type="button" onClick={prevStep}>
                                            Anterior
                                        </SecondaryButton>
                                        <PrimaryButton type="button" onClick={nextStep} disabled={data.coleadores.length !== championship.coleadores_count || !data.entry_name}>
                                            Siguiente: Datos de Pago
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Pago</h3>
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
