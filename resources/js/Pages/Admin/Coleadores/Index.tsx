import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useMemo } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

interface Coleador {
    id: number;
    name: string;
}

export default function Index({ coleadores }: { coleadores: Coleador[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingColeador, setEditingColeador] = useState<Coleador | null>(null);

    // DataTable States
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [sortBy, setSortBy] = useState<'name' | 'id'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    // DataTable Logic
    const filteredColeadores = useMemo(() => {
        return coleadores
            .filter(coleador =>
                coleador.name.toLowerCase().includes(search.toLowerCase()) ||
                coleador.id.toString().includes(search)
            )
            .sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [coleadores, search, sortBy, sortDirection]);

    const totalPages = Math.ceil(filteredColeadores.length / itemsPerPage);
    const paginatedColeadores = filteredColeadores.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSort = (column: 'name' | 'id') => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingColeador(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (coleador: Coleador) => {
        setData('name', coleador.name);
        clearErrors();
        setEditingColeador(coleador);
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingColeador) {
            put(route('admin.coleadores.update', editingColeador.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.coleadores.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este coleador?')) {
            destroy(route('admin.coleadores.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Coleadores" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-parley-brown leading-tight">
                                Coleadores
                            </h1>
                        </div>
                        <PrimaryButton onClick={openCreateModal} className="w-full sm:w-auto justify-center py-3 sm:py-2 text-sm">
                            Registrar Coleador <span className="ml-2 text-lg">+</span>
                        </PrimaryButton>
                    </div>

                    {/* Toolbar de Búsqueda y Filtros */}
                    <div className="bg-white p-4 rounded-t-lg border-x border-t border-parley-gold/50 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-parley-brown">Ver</span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border-parley-gold/50 focus:ring-parley-red focus:border-parley-red rounded-md text-sm py-1 pr-8"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm font-medium text-parley-brown">filas</span>
                            </div>
                        </div>

                        <div className="w-full lg:max-w-md relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-parley-brown/40" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <TextInput
                                placeholder="Buscar por nombre o ID..."
                                className="pl-10 w-full"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm border border-parley-gold/50">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-parley-gold/20">
                                <thead className="bg-parley-cream">
                                    <tr>
                                        <th 
                                            className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors"
                                            onClick={() => toggleSort('id')}
                                        >
                                            <div className="flex items-center gap-1">
                                                ID
                                                {sortBy === 'id' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-parley-brown/60 cursor-pointer hover:text-parley-red transition-colors"
                                            onClick={() => toggleSort('name')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Nombre
                                                {sortBy === 'name' && (
                                                    <svg className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-parley-brown/60">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parley-gold/20 bg-white">
                                    {paginatedColeadores.map((coleador) => (
                                        <tr key={coleador.id} className="hover:bg-parley-cream/30 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-parley-brown/60">
                                                #{coleador.id}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-parley-brown">
                                                {coleador.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => openEditModal(coleador)}
                                                    className="text-parley-red hover:underline font-bold"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coleador.id)}
                                                    className="text-red-600 hover:underline font-bold"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedColeadores.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-parley-brown/40 italic">
                                                No se encontraron coleadores que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="bg-parley-cream p-4 border-t border-parley-gold/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-parley-brown/80 font-medium">
                                Mostrando <span className="text-parley-brown font-bold">{paginatedColeadores.length}</span> de <span className="text-parley-brown font-bold">{filteredColeadores.length}</span> coleadores
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                                    >Anterior</button>
                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const p = i + 1;
                                            if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                                                if (Math.abs(p - currentPage) === 3) return <span key={p} className="px-1 text-parley-brown/40">...</span>;
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${
                                                        currentPage === p 
                                                            ? 'bg-parley-red text-white shadow-sm' 
                                                            : 'bg-white border border-parley-gold/50 text-parley-brown hover:bg-parley-cream'
                                                    }`}
                                                >{p}</button>
                                            );
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-white border border-parley-gold/50 rounded-md text-sm font-bold disabled:opacity-50 hover:bg-parley-cream transition-colors"
                                    >Siguiente</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isCreateModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-parley-brown">
                        {editingColeador ? 'Editar Coleador' : 'Agregar Nuevo Coleador'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Nombre del Coleador" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Ej. Juan Pérez"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {editingColeador ? 'Guardar Cambios' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
