import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Toast from '@/Components/Toast';
import ErrorModal from '@/Components/ErrorModal';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage().props as any;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'error' }>({
        message: null,
        type: 'success',
    });

    const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
        show: false,
        message: '',
    });

    useEffect(() => {
        if (flash.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash.error) {
            setErrorModal({ show: true, message: flash.error });
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-parley-cream">
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, message: null })} 
            />

            <ErrorModal
                show={errorModal.show}
                onClose={() => setErrorModal({ ...errorModal, show: false })}
                message={errorModal.message}
            />
            
            <nav className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center mr-6">
                                <Link href="/dashboard">
                                    <ApplicationLogo className="block h-14 w-auto" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('admin.championships.index')}
                                    active={route().current('admin.championships.*')}
                                >
                                    Campeonatos
                                </NavLink>
                                <NavLink
                                    href={route('admin.coleadores.index')}
                                    active={route().current('admin.coleadores.*')}
                                >
                                    Coleadores
                                </NavLink>
                                <NavLink
                                    href={route('admin.customers.index')}
                                    active={route().current('admin.customers.*')}
                                >
                                    Clientes
                                </NavLink>
                                <NavLink
                                    href={route('admin.payments.index')}
                                    active={route().current('admin.payments.*')}
                                >
                                    Pagos
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-3 rounded-md border border-parley-gold/10 bg-parley-cream/20 px-3 py-1.5 text-sm font-medium leading-4 text-parley-brown transition duration-150 ease-in-out hover:bg-parley-cream/50 hover:text-parley-red focus:outline-none"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-parley-red text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-1 h-4 w-4 opacity-50"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-parley-gold transition duration-150 ease-in-out hover:bg-parley-cream hover:text-parley-red focus:bg-parley-cream focus:text-parley-red focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.championships.index')}
                            active={route().current('admin.championships.*')}
                        >
                            Campeonatos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.coleadores.index')}
                            active={route().current('admin.coleadores.*')}
                        >
                            Coleadores
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.customers.index')}
                            active={route().current('admin.customers.*')}
                        >
                            Clientes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.payments.index')}
                            active={route().current('admin.payments.*')}
                        >
                            Pagos
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-parley-gold/20 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-parley-brown">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-parley-brown/70">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">{children}</main>
        </div>
    );
}
