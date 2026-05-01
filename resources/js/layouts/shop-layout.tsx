import type { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

interface ShopLayoutProps {
    children: ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
            <Navbar />
            {children}
            <Toaster />
            <Footer />
        </div>
    );
}
