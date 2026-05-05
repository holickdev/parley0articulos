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
}

interface Round {
    id: number;
    number: number;
}

interface Coleador {
    id: number;
    name: string;
}

interface Score {
    id: number;
    round_id: number;
    coleador_id: number;
    effective_coleadas: number;
    null_coleadas: number;
    gate_bulls: number;
    articles: number;
}

interface Props {
    score: Score;
    championship: Championship;
    rounds: Round[];
    coleadores: Coleador[];
}

export default function Edit({ score, championship, rounds, coleadores }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        round_id: score.round_id.toString(),
        coleador_id: score.coleador_id.toString(),
        effective_coleadas: score.effective_coleadas.toString(),
        null_coleadas: score.null_coleadas.toString(),
        gate_bulls: score.gate_bulls.toString(),
        articles: score.articles.toString(),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.scores.update', score.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-parley-brown">
                    Editar Puntuación: {championship.name}
                </h2>
            }
        >
            <Head title={`Editar Resultado - ${championship.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="round_id" value="Ronda" />
                                    <select
                                        id="round_id"
                                        value={data.round_id}
                                        onChange={(e) => setData('round_id', e.target.value)}
                                        className="mt-1 block w-full border-parley-gold/50 focus:border-parley-red focus:ring-parley-red rounded-md shadow-sm"
                                        required
                                    >
                                        {rounds.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                Ronda {r.number}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.round_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="coleador_id" value="Coleador" />
                                    <select
                                        id="coleador_id"
                                        value={data.coleador_id}
                                        onChange={(e) => setData('coleador_id', e.target.value)}
                                        className="mt-1 block w-full border-parley-gold/50 focus:border-parley-red focus:ring-parley-red rounded-md shadow-sm"
                                        required
                                    >
                                        {coleadores.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.coleador_id} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <InputLabel htmlFor="effective_coleadas" value="CE (Efectivas)" className="text-green-700 font-bold" />
                                    <TextInput
                                        id="effective_coleadas"
                                        type="number"
                                        value={data.effective_coleadas}
                                        onChange={(e) => setData('effective_coleadas', e.target.value)}
                                        className="mt-1 block w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                    <InputError message={errors.effective_coleadas} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="null_coleadas" value="CN (Nulas)" className="text-red-700 font-bold" />
                                    <TextInput
                                        id="null_coleadas"
                                        type="number"
                                        value={data.null_coleadas}
                                        onChange={(e) => setData('null_coleadas', e.target.value)}
                                        className="mt-1 block w-full border-red-300 focus:border-red-500 focus:ring-red-500"
                                        required
                                    />
                                    <InputError message={errors.null_coleadas} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="gate_bulls" value="TP (Puerta)" className="text-blue-700 font-bold" />
                                    <TextInput
                                        id="gate_bulls"
                                        type="number"
                                        value={data.gate_bulls}
                                        onChange={(e) => setData('gate_bulls', e.target.value)}
                                        className="mt-1 block w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <InputError message={errors.gate_bulls} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="articles" value="AR (Artículos)" className="text-yellow-700 font-bold" />
                                    <TextInput
                                        id="articles"
                                        type="number"
                                        value={data.articles}
                                        onChange={(e) => setData('articles', e.target.value)}
                                        className="mt-1 block w-full border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        required
                                    />
                                    <InputError message={errors.articles} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Link href={route('admin.championships.scores.index', championship.id)}>
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
