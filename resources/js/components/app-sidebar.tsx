import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Boxes,
    CircleDollarSign,
    ClipboardList,
    FileText,
    Heart,
    Home,
    Image,
    Layers3,
    LayoutGrid,
    Package,
    ReceiptText,
    Settings,
    ShoppingBag,
    ShieldCheck,
    Tags,
    Truck,
    UserCog,
    Users,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import type { NavGroup } from '@/components/nav-main';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dasbor',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavGroups: NavGroup[] = [
    {
        title: 'Ringkasan',
        items: [
            {
                title: 'Dasbor Admin',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Katalog',
        items: [
            {
                title: 'Produk',
                href: '/admin/products',
                icon: Package,
            },
            {
                title: 'Varian',
                href: '/admin/product-variants',
                icon: Boxes,
            },
            {
                title: 'Kategori',
                href: '/admin/categories',
                icon: Tags,
            },
            {
                title: 'Koleksi',
                href: '/admin/collections',
                icon: Layers3,
            },
            {
                title: 'Stok',
                href: '/admin/stock',
                icon: BarChart3,
            },
            {
                title: 'Log Stok',
                href: '/admin/stock/logs',
                icon: ReceiptText,
            },
        ],
    },
    {
        title: 'Penjualan',
        items: [
            {
                title: 'Pesanan',
                href: '/admin/orders',
                icon: ShoppingBag,
            },
            {
                title: 'Pembayaran',
                href: '/admin/payments',
                icon: WalletCards,
            },
            {
                title: 'Log Pembayaran',
                href: '/admin/payment-logs',
                icon: FileText,
            },
            {
                title: 'Pengiriman',
                href: '/admin/shipments',
                icon: Truck,
            },
            {
                title: 'Log Biteship',
                href: '/admin/biteship-webhook-logs',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Pelanggan',
        items: [
            {
                title: 'Pelanggan',
                href: '/admin/customers',
                icon: Users,
            },
            {
                title: 'Alamat',
                href: '/admin/customer-addresses',
                icon: Home,
            },
            {
                title: 'Notifikasi',
                href: '/admin/notifications',
                icon: Bell,
            },
            {
                title: 'Insight Wishlist',
                href: '/admin/wishlists',
                icon: Heart,
            },
        ],
    },
    {
        title: 'Pemasaran & Konten',
        items: [
            {
                title: 'Voucher',
                href: '/admin/vouchers',
                icon: CircleDollarSign,
            },
            {
                title: 'Banner',
                href: '/admin/banners',
                icon: Image,
            },
            {
                title: 'Halaman',
                href: '/admin/pages',
                icon: FileText,
            },
        ],
    },
    {
        title: 'Sistem',
        items: [
            {
                title: 'Laporan Penjualan',
                href: '/admin/reports/sales',
                icon: BarChart3,
            },
            {
                title: 'Laporan Produk',
                href: '/admin/reports/products',
                icon: ClipboardList,
            },
            {
                title: 'Laporan Pelanggan',
                href: '/admin/reports/customers',
                icon: Users,
            },
            {
                title: 'Laporan Pengiriman',
                href: '/admin/reports/shipments',
                icon: Truck,
            },
            {
                title: 'Laporan Voucher',
                href: '/admin/reports/vouchers',
                icon: CircleDollarSign,
            },
            {
                title: 'Log Audit',
                href: '/admin/audit-logs',
                icon: ShieldCheck,
            },
            {
                title: 'Pengaturan',
                href: '/admin/settings',
                icon: Settings,
            },
            {
                title: 'Pengguna Admin',
                href: '/admin/admin-users',
                icon: UserCog,
            },
        ],
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const isAdmin = url.startsWith('/admin');
    const homeHref = isAdmin ? '/admin/dashboard' : dashboard();

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                Dasbor Admin
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin ? (
                    <NavMain groups={adminNavGroups} />
                ) : (
                    <NavMain items={mainNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
