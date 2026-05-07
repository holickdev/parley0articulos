import { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export default function Toggle({
    checked,
    onChange,
    label,
    description,
    className = '',
    ...props
}: Props) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <span className="flex grow flex-col">
                {label && (
                    <span className="text-sm font-bold text-parley-brown" id="toggle-label">
                        {label}
                    </span>
                )}
                {description && (
                    <span className="text-xs text-parley-brown/60" id="toggle-description">
                        {description}
                    </span>
                )}
            </span>
            <button
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-parley-red focus:ring-offset-2 ${
                    checked ? 'bg-parley-red' : 'bg-parley-gold/30'
                }`}
                role="switch"
                aria-checked={checked}
                aria-labelledby="toggle-label"
                aria-describedby="toggle-description"
                onClick={() => onChange(!checked)}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
                <input
                    {...props}
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </button>
        </div>
    );
}
