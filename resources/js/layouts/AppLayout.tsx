import React, { ReactNode } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#333333] font-sans overflow-x-hidden selection:bg-[#555024] selection:text-white">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
