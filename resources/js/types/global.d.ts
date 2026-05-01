import type { Auth } from '@/types/auth';
import type { FlashToast } from '@/types/ui';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            flash?: {
                success?: string | null;
                error?: string | null;
                info?: string | null;
                warning?: string | null;
                toast?: FlashToast | null;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
