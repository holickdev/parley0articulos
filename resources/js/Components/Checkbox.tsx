import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-parley-gold text-parley-red shadow-sm focus:ring-parley-red ' +
                className
            }
        />
    );
}
