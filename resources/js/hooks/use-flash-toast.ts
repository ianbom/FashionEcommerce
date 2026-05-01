import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type FlashProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
        info?: string | null;
        warning?: string | null;
        toast?: FlashToast | null;
    };
};

let lastToastKey: string | null = null;

export function useFlashToast(): void {
    const { flash } = usePage<FlashProps>().props;

    useEffect(() => {
        const data =
            flash?.toast ??
            flashMessage('success', flash?.success) ??
            flashMessage('error', flash?.error) ??
            flashMessage('info', flash?.info) ??
            flashMessage('warning', flash?.warning);

        if (!data) {
            return;
        }

        const key = data.id ?? `${data.type}:${data.message}`;

        if (lastToastKey === key) {
            return;
        }

        lastToastKey = key;
        toast[data.type](data.message);
    }, [
        flash?.error,
        flash?.info,
        flash?.success,
        flash?.toast,
        flash?.warning,
    ]);
}

function flashMessage(
    type: FlashToast['type'],
    message?: string | null,
): FlashToast | null {
    if (!message) {
        return null;
    }

    return { type, message };
}
