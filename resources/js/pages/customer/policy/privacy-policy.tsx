import { Head, Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import {
    CheckCircle2,
    User,
    Box,
    CreditCard,
    Truck,
    Cookie,
    ShieldCheck,
    Share2,
    Megaphone,
    Calendar,
    Shield,
    Baby,
    RefreshCw,
    Mail,
    Lock,
    Ban,
    ChevronDown,
    Clock,
    MessageCircle,
    FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const sidebarItems = [
    { id: 'introduction', icon: CheckCircle2, label: '1. Introduction' },
    { id: 'info-collect', icon: User, label: '2. Information We Collect' },
    { id: 'use-info', icon: Box, label: '3. How We Use Your Information' },
    { id: 'payment', icon: CreditCard, label: '4. Payment Information' },
    { id: 'shipping', icon: Truck, label: '5. Shipping & Delivery Data' },
    {
        id: 'cookies',
        icon: Cookie,
        label: '6. Cookies & Tracking Technologies',
    },
    { id: 'protect', icon: ShieldCheck, label: '7. How We Protect Your Data' },
    {
        id: 'sharing',
        icon: Share2,
        label: '8. Data Sharing With Third Parties',
    },
    { id: 'account', icon: User, label: '9. User Account & Profile Data' },
    { id: 'marketing', icon: Megaphone, label: '10. Marketing Communications' },
    { id: 'retention', icon: Calendar, label: '11. Data Retention' },
    { id: 'rights', icon: Shield, label: '12. User Rights' },
    { id: 'children', icon: Baby, label: "13. Children's Privacy" },
    { id: 'changes', icon: RefreshCw, label: '14. Changes to This Policy' },
    { id: 'contact', icon: Mail, label: '15. Contact Information' },
];

const sections = [
    {
        id: 'introduction',
        title: 'Introduction',
        content:
            "This Privacy Policy explains how Auréa Syar'i collects, uses, discloses, and protects your personal information when you use our website.",
    },
    {
        id: 'info-collect',
        title: 'Information We Collect',
        content:
            'We collect personal information you provide directly, such as your name, email address, phone number, shipping address, and order details.',
    },
    {
        id: 'use-info',
        title: 'How We Use Your Information',
        content:
            'We use your information to process orders, deliver products, improve our services, communicate with you, and personalize your experience.',
    },
    {
        id: 'payment',
        title: 'Payment Information',
        content: 'Secure payment is processed through Midtrans.',
    },
    {
        id: 'shipping',
        title: 'Shipping & Delivery Data',
        content:
            'Shipping options and delivery estimates may be calculated using Biteship.',
    },
    {
        id: 'cookies',
        title: 'Cookies & Tracking Technologies',
        content:
            'We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and support our marketing efforts.',
    },
    {
        id: 'protect',
        title: 'How We Protect Your Data',
        content:
            'We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.',
    },
    {
        id: 'sharing',
        title: 'Data Sharing With Third Parties',
        content:
            'We do not sell your personal information. We may share data with trusted service providers who help us operate our business.',
    },
    {
        id: 'account',
        title: 'User Account & Profile Data',
        content:
            'Your account information helps us provide a personalized shopping experience and save your preferences for future orders.',
    },
    {
        id: 'marketing',
        title: 'Marketing Communications',
        content:
            'You may unsubscribe from marketing communications at any time.',
    },
    {
        id: 'retention',
        title: 'Data Retention',
        content:
            'We retain your information only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.',
    },
    {
        id: 'rights',
        title: 'User Rights',
        content:
            'You have the right to access, update, correct, or delete your personal information. Contact us for assistance.',
    },
    {
        id: 'children',
        title: "Children's Privacy",
        content:
            'Our website is not intended for children under 13. We do not knowingly collect personal information from children.',
    },
    {
        id: 'changes',
        title: 'Changes to This Policy',
        content:
            'We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated date.',
    },
    {
        id: 'contact',
        title: 'Contact Information',
        content:
            'If you have any questions about this Privacy Policy, please contact us using the details below.',
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

export default function PrivacyPolicy() {
    const scrollToSection = (id: string) => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <ShopLayout>
            <Head title="Privacy Policy" />

            {/* Hero Section */}
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
                                    Privacy Policy
                                </span>
                            </div>
                            <p className="mb-4 inline-flex border-l border-[#8b5e4c] pl-3 text-xs font-semibold tracking-[0.22em] text-[#8b5e4c] uppercase">
                                Customer Data Policy
                            </p>
                            <h1 className="mb-5 max-w-xl font-serif text-4xl leading-tight text-[#53362d] md:text-5xl lg:text-6xl">
                                Privacy Policy
                            </h1>
                            <p className="max-w-xl text-base leading-8 text-[#846b60] sm:text-lg">
                                Learn how we collect, use, protect, and manage
                                your personal information while you shop at
                                Auréa Syar'i.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#846b60]">
                                <span className="border-b border-[#dcc8b8] pb-1">
                                    Last updated: April 28, 2026
                                </span>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('contact')}
                                    className="border-b border-[#53362d] pb-1 font-medium text-[#53362d] transition hover:text-[#8b5e4c] active:scale-[0.98]"
                                >
                                    Contact privacy team
                                </button>
                            </div>
                        </div>

                        <div className="relative hidden min-h-72 md:block lg:min-h-96">
                            {/* Placeholder for the design image */}
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

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
                    {/* Sidebar */}
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
                                {sidebarItems.map((item) => {
                                    return (
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
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="min-w-0">
                        <div className="mb-10 border-b border-[#eadfd4] pb-8">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                                <ShieldCheck
                                    size={28}
                                    strokeWidth={1.5}
                                    className="mt-1 shrink-0 text-[#8b5e4c]"
                                />
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold text-[#53362d]">
                                        Your Privacy Matters
                                    </h3>
                                    <p className="max-w-3xl leading-7 text-[#846b60]">
                                        We only collect the information needed
                                        to process your orders, deliver your
                                        purchases, improve your shopping
                                        experience, and provide customer
                                        support.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="mb-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
                            <FeatureBox icon={Lock} title="Secure Payment" />
                            <FeatureBox
                                icon={ShieldCheck}
                                title="Protected Personal Data"
                            />
                            <FeatureBox
                                icon={Truck}
                                title="Trusted Delivery Partners"
                            />
                            <FeatureBox icon={Ban} title="No Data Selling" />
                        </div>

                        {/* Accordion List */}
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

                        {/* Contact Information */}
                        <div className="grid gap-5 border-t border-[#eadfd4] pt-8 md:grid-cols-3">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Mail size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Email
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        privacy@aureasyari.com
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
