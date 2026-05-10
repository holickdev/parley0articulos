import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-[3px] px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-parley-cyan text-white font-bold'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/30') +
                className
            }
        >
            {children}
        </Link>
    );
}
