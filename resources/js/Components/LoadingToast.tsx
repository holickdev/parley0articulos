import { Transition } from '@headlessui/react';

interface Props {
    show: boolean;
    message: string;
}

export default function LoadingToast({ show, message }: Props) {
    return (
        <div className="fixed bottom-5 right-5 z-[100] pointer-events-none">
            <Transition
                show={show}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 border-parley-red p-4 items-center gap-4">
                    <div className="flex-shrink-0">
                        <svg className="animate-spin h-6 w-6 text-parley-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-black text-parley-brown uppercase tracking-tight">
                            Generando PDF
                        </p>
                        <p className="text-xs text-parley-brown/70 font-medium">
                            {message}
                        </p>
                    </div>
                </div>
            </Transition>
        </div>
    );
}
