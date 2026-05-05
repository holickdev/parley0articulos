import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-parley-gold bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-parley-brown shadow-sm transition duration-150 ease-in-out hover:bg-parley-cream focus:outline-none focus:ring-2 focus:ring-parley-gold focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
