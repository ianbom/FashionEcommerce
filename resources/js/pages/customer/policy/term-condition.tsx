import { Head, Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import {
    Box,
    Calendar,
    ChevronDown,
    Clock,
    FileText,
    Mail,
    MessageCircle,
    Scale,
    ShieldCheck,
    ShoppingBag,
    UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const sidebarItems = [
    { id: 'agreement', icon: Scale, label: '1. Agreement to Terms' },
    {
        id: 'intellectual-property',
        icon: FileText,
        label: '2. Intellectual Property Rights',
    },
    {
        id: 'user-representations',
        icon: UserCheck,
        label: '3. User Representations',
    },
    {
        id: 'products-pricing',
        icon: ShoppingBag,
        label: '4. Products and Pricing',
    },
    {
        id: 'modifications',
        icon: Calendar,
        label: '5. Modifications and Interruptions',
    },
];

const sections = [
    {
        id: 'agreement',
        title: 'Agreement to Terms',
        content:
            "These Terms and Conditions constitute a legally binding agreement between you and Auréa Syar'i concerning your access to and use of our website and related services.",
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property Rights',
        content:
            'Unless otherwise indicated, the site and its content, source code, databases, functionality, website designs, text, photographs, graphics, trademarks, and logos are owned or controlled by us or licensed to us.',
    },
    {
        id: 'user-representations',
        title: 'User Representations',
        content:
            'By using the site, you represent that information you submit is true, accurate, current, and complete, and that you have the legal capacity to comply with these Terms and Conditions.',
    },
    {
        id: 'products-pricing',
        title: 'Products and Pricing',
        content:
            'We make every effort to display product colors, features, specifications, and details accurately. Product information and pricing may change without notice.',
    },
    {
        id: 'modifications',
        title: 'Modifications and Interruptions',
        content:
            'We reserve the right to change, modify, or remove site contents at any time or for any reason at our sole discretion without notice.',
    },
];

function FeatureBox({
    icon: Icon,
    title,
}: {
    icon: LucideIcon;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3 border-b border-[#eadfd4] py-4 transition duration-300 hover:border-[#cdb5a4]">
            <Icon
                size={22}
                strokeWidth={1.4}
                className="shrink-0 text-[#8b5e4c]"
            />
            <span className="text-sm leading-snug font-medium text-[#53362d] sm:text-base">
                {title}
            </span>
        </div>
    );
}

function AccordionItem({
    item,
    index,
    isLast,
}: {
    item: (typeof sections)[number];
    index: number;
    isLast: boolean;
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section
            id={item.id}
            className={`${isLast ? '' : 'border-b border-[#eadfd4]'} scroll-mt-28 py-6`}
        >
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${item.id}-content`}
                className="group flex w-full items-start justify-between gap-5 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex gap-4">
                    <span className="w-8 shrink-0 pt-0.5 text-sm font-semibold text-[#bc9e90]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                        <span className="block text-base font-semibold text-[#53362d] sm:text-lg">
                            {item.title}
                        </span>
                        <div
                            id={`${item.id}-content`}
                            className={`grid transition-all duration-300 ease-out ${isOpen ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <p className="max-w-3xl text-sm leading-7 text-[#846b60] sm:text-base">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    </span>
                </span>
                <ChevronDown
                    size={20}
                    className={`mt-1 shrink-0 text-[#bc9e90] transition duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-[#8b5e4c]`}
                />
            </button>
        </section>
    );
}

export default function TermCondition() {
    const scrollToSection = (id: string) =>
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <ShopLayout>
            <Head title="Terms & Conditions" />
            <div className="relative w-full overflow-hidden border-b border-[#eadfd4] bg-[#fcfbf9] pt-8 pb-14 sm:pt-10 lg:pb-20">
                <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-[#f6eee7]"></div>
                <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                        <div className="max-w-2xl">
                            <div className="mb-8 flex items-center text-sm font-medium text-[#846b60]">
                                <Link
                                    href="/"
                                    className="transition-colors hover:text-[#8b5e4c]"
                                >
                                    Home
                                </Link>
                                <span className="mx-2 text-[#bc9e90]">/</span>
                                <span className="text-[#53362d]">
                                    Terms & Conditions
                                </span>
                            </div>
                            <p className="mb-4 inline-flex border-l border-[#8b5e4c] pl-3 text-xs font-semibold tracking-[0.22em] text-[#8b5e4c] uppercase">
                                Customer Terms Policy
                            </p>
                            <h1 className="mb-5 max-w-xl font-serif text-4xl leading-tight text-[#53362d] md:text-5xl lg:text-6xl">
                                Terms & Conditions
                            </h1>
                            <p className="max-w-xl text-base leading-8 text-[#846b60] sm:text-lg">
                                Please read these terms and conditions carefully
                                before using our website.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#846b60]">
                                <span className="border-b border-[#dcc8b8] pb-1">
                                    Last updated: May 15, 2024
                                </span>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('contact')}
                                    className="border-b border-[#53362d] pb-1 font-medium text-[#53362d] transition hover:text-[#8b5e4c] active:scale-[0.98]"
                                >
                                    Contact support team
                                </button>
                            </div>
                        </div>
                        <div className="relative hidden min-h-72 md:block lg:min-h-96">
                            <div className="absolute inset-0 flex items-center justify-end">
                                <img
                                    src="/images/privacy-hero.png"
                                    alt=""
                                    className="h-full max-h-[26rem] w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
                    <div className="hidden lg:block">
                        <div className="sticky top-24 border-l border-[#eadfd4] pl-5">
                            <div className="mb-5 flex items-center gap-3 text-base text-[#53362d]">
                                <FileText
                                    size={20}
                                    strokeWidth={1.5}
                                    className="text-[#8b5e4c]"
                                />
                                <h2 className="font-serif">On This Page</h2>
                            </div>
                            <ul className="space-y-1.5">
                                {sidebarItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                scrollToSection(item.id)
                                            }
                                            className="flex w-full items-center gap-3 py-2.5 text-left text-sm font-medium text-[#846b60] transition duration-300 hover:translate-x-1 hover:text-[#53362d] active:scale-[0.98]"
                                        >
                                            <item.icon
                                                size={18}
                                                strokeWidth={1.5}
                                                className="shrink-0 text-[#bc9e90]"
                                            />
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="mb-10 border-b border-[#eadfd4] pb-8">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                                <Scale
                                    size={28}
                                    strokeWidth={1.5}
                                    className="mt-1 shrink-0 text-[#8b5e4c]"
                                />
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold text-[#53362d]">
                                        Terms For Safe Shopping
                                    </h3>
                                    <p className="max-w-3xl leading-7 text-[#846b60]">
                                        These terms define site usage, account
                                        responsibilities, product information
                                        rules, and service changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
                            <FeatureBox icon={Scale} title="Binding Terms" />
                            <FeatureBox
                                icon={ShieldCheck}
                                title="Protected Content"
                            />
                            <FeatureBox
                                icon={UserCheck}
                                title="User Responsibility"
                            />
                            <FeatureBox
                                icon={Box}
                                title="Product Information"
                            />
                        </div>
                        <div className="mb-10 border-y border-[#eadfd4]">
                            {sections.map((section, index) => (
                                <AccordionItem
                                    key={section.id}
                                    item={section}
                                    index={index}
                                    isLast={index === sections.length - 1}
                                />
                            ))}
                        </div>
                        <div
                            id="contact"
                            className="grid scroll-mt-28 gap-5 border-t border-[#eadfd4] pt-8 md:grid-cols-3"
                        >
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Mail size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Email
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        support@aureasyari.com
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-[#eadfd4] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <MessageCircle
                                        size={22}
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        WhatsApp
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        +62 812-0000-0000
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-[#eadfd4] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Clock size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Business hours
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        Monday - Saturday, 09:00 - 17:00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
