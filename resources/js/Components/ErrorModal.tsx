import { Fragment } from 'react';
import Modal from './Modal';
import SecondaryButton from './SecondaryButton';

interface ErrorModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    errors?: Record<string, string>;
}

export default function ErrorModal({
    show,
    onClose,
    title = 'Ha ocurrido un error',
    message = 'Se encontraron algunos problemas al procesar tu solicitud.',
    errors = {},
}: ErrorModalProps) {
    const errorList = Object.entries(errors);

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-8 h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                    </svg>
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>

                <div className="mt-2">
                    {errorList.length > 0 ? (
                        <>
                            <p className="text-sm text-parley-brown/70 mb-4">
                                Se encontraron los siguientes problemas:
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 max-h-60 overflow-y-auto">
                                <ul className="list-disc list-inside space-y-1">
                                    {errorList.map(([key, value]) => (
                                        <li key={key} className="text-xs text-red-700 font-medium">
                                            <span className="font-bold uppercase">{key.replace(/\./g, ' ')}:</span> {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-parley-brown/70 mb-4">
                            {message}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>
                        Cerrar
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
