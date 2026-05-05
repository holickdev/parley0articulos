import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-parley-red bg-parley-red/10 text-parley-red focus:border-parley-brown focus:bg-parley-red/20 focus:text-parley-brown'
                    : 'border-transparent text-parley-brown/70 hover:border-parley-gold hover:bg-parley-cream hover:text-parley-brown focus:border-parley-gold focus:bg-parley-cream focus:text-parley-brown'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
