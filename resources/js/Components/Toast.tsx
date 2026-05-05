import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';

interface Props {
    message: string | null;
    type?: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 5000, onClose }: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (message) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Wait for transition to finish
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [message, duration, onClose]);

    const colors = {
        success: {
            bg: 'bg-white',
            border: 'border-parley-gold',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            text: 'text-parley-brown',
            accent: 'bg-parley-gold'
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-200',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            text: 'text-parley-brown',
            accent: 'bg-red-600'
        }
    };

    const config = colors[type];

    return (
        <div className="fixed top-5 right-5 z-[100] flex flex-col items-end gap-2 pointer-events-none">
            <Transition
                show={show}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className={`w-full sm:w-96 ${config.bg} shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${config.border}`}>
                    <div className="flex-1 p-5">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className={`h-10 w-10 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconColor}`}>
                                    {type === 'success' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className={`text-sm font-black ${config.text} uppercase tracking-tight`}>
                                    {type === 'success' ? 'Éxito' : 'Error'}
                                </p>
                                <p className="mt-1 text-sm text-parley-brown/70 font-medium">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-parley-gold/10">
                        <button
                            onClick={() => setShow(false)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-parley-gold hover:text-parley-red focus:outline-none transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
