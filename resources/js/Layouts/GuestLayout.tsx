import ApplicationLogo from '@/Components/ApplicationLogo';
import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { flash } = usePage().props as any;
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

    return (
        <div className="flex min-h-screen flex-col items-center bg-parley-cream pt-6 sm:justify-center sm:pt-0">
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, message: null })} 
            />
            
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24 fill-current text-parley-red" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-xl border border-parley-gold/20 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
