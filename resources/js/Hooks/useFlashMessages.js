import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { showSuccess, showError, showWarning, showInfo } from '@/Utils/swal';

export default function useFlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            showSuccess(flash.success);
        }
        if (flash?.error) {
            showError(flash.error);
        }
        if (flash?.warning) {
            showWarning(flash.warning);
        }
        if (flash?.info) {
            showInfo(flash.info);
        }
    }, [flash]);
}
