import ApplicationLogo from '@/Components/ApplicationLogo';
import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { flash, auth } = usePage().props as any;
    const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' }>({
        message: null,
        type: 'success',
    });

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    // Determinar si es una página de autenticación (Login/Register) o una vista pública de datos
    // Las vistas de datos suelen tener tablas y necesitan más espacio.
    const isAuthPage = usePage().component.startsWith('Auth/');

    return (
        <div className={`min-h-screen bg-parley-cream ${isAuthPage ? 'flex flex-col items-center pt-6 sm:justify-center sm:pt-0' : ''}`}>
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, message: null })} 
            />

            {!isAuthPage && (
                <nav className="bg-white shadow-sm border-b border-parley-gold/10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 justify-between items-center">
                            <Link href="/" className="flex items-center gap-3">
                                <ApplicationLogo className="h-12 w-12 text-parley-red" />
                                <span className="font-black text-parley-brown tracking-tighter text-xl italic uppercase">Parley 0 Artículos</span>
                            </Link>
                            
                            <div className="flex gap-4">
                                {auth.user ? (
                                    <Link href={route('admin')} className="text-sm font-bold text-parley-red hover:underline">Ir al Panel</Link>
                                ) : (
                                    <Link href={route('login')} className="text-sm font-bold text-parley-brown/60 hover:text-parley-red transition-colors">Iniciar Sesión</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            )}
            
            {isAuthPage ? (
                <>
                    <div>
                        <Link href="/">
                            <ApplicationLogo className="h-24 w-24 fill-current text-parley-red" />
                        </Link>
                    </div>

                    <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-xl border border-parley-gold/20 sm:max-w-md sm:rounded-lg">
                        {children}
                    </div>
                </>
            ) : (
                <main>{children}</main>
            )}

            {!isAuthPage && (
                <footer className="bg-parley-brown py-12 text-center">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <ApplicationLogo className="h-12 w-12 mx-auto text-parley-gold/20 mb-4" />
                        <p className="text-parley-gold/40 text-sm font-medium">© {new Date().getFullYear()} PARLEY 0 ARTÍCULOS - Sistema de Gestión de Toros Coleados</p>
                    </div>
                </footer>
            )}
        </div>
    );
}
