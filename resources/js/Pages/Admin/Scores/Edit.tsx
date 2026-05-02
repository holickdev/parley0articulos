import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

interface Turn {
    id: number;
    number: number;
    round: {
        number: number;
        championship: { name: string }
    }
}

interface Coleador {
    id: number;
    name: string;
}

interface Score {
    id: number;
    turn_id: number;
    coleador_id: number;
    effective_coleadas: number;
    null_coleadas: number;
    gate_bulls: number;
    articles: number;
}

interface Props {
    score: Score;
    turns: Turn[];
    coleadores: Coleador[];
}

export default function Edit({ score, turns, coleadores }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        turn_id: score.turn_id.toString(),
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar Puntuación #{score.id}
                </h2>
            }
        >
            <Head title="Editar Resultado" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="turn_id" value="Turno y Campeonato" />
                                    <select
                                        id="turn_id"
                                        value={data.turn_id}
                                        onChange={(e) => setData('turn_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        required
                                    >
                                        {turns.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.round.championship.name} - R{t.round.number} T{t.number}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.turn_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="coleador_id" value="Coleador" />
                                    <select
                                        id="coleador_id"
                                        value={data.coleador_id}
                                        onChange={(e) => setData('coleador_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
                                <Link href={route('admin.scores.index')}>
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
