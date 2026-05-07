import { useFlashToast } from '@/hooks/use-flash-toast';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    useFlashToast();

    return (
        <Sonner
            theme="light"
            className="toaster group"
            position="top-right"
            closeButton
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-white/70 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-zinc-900 group-[.toaster]:border-white/50 group-[.toaster]:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-[.toaster]:rounded-2xl dark:group-[.toaster]:bg-zinc-900/70 dark:group-[.toaster]:border-zinc-800/50 dark:group-[.toaster]:text-zinc-100 transition-all duration-300",
                    description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    closeButton: "group-[.toast]:top-3 group-[.toast]:right-3 group-[.toast]:left-auto group-[.toast]:translate-x-0 group-[.toast]:translate-y-0 group-[.toast]:border group-[.toast]:border-zinc-200 group-[.toast]:bg-white group-[.toast]:text-zinc-500 group-[.toast]:shadow-sm group-[.toast]:transition-colors hover:group-[.toast]:bg-zinc-100 hover:group-[.toast]:text-zinc-900 dark:group-[.toast]:border-zinc-700 dark:group-[.toast]:bg-zinc-900 dark:group-[.toast]:text-zinc-400 dark:hover:group-[.toast]:bg-zinc-800 dark:hover:group-[.toast]:text-zinc-100",
                },
            }}
            style={
                {
                    '--normal-bg': 'transparent',
                    '--normal-text': 'inherit',
                    '--normal-border': 'transparent',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
