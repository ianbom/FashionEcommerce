import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    Boxes,
    CircleDollarSign,
    FileText,
    FolderGit2,
    Home,
    Image,
    Layers3,
    LayoutGrid,
    Package,
    ReceiptText,
    ShoppingBag,
    Tags,
    Truck,
    Users,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Variants',
        href: '/admin/product-variants',
        icon: Boxes,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'Collections',
        href: '/admin/collections',
        icon: Layers3,
    },
    {
        title: 'Stock',
        href: '/admin/stock',
        icon: BarChart3,
    },
    {
        title: 'Stock Logs',
        href: '/admin/stock/logs',
        icon: ReceiptText,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: WalletCards,
    },
    {
        title: 'Payment Logs',
        href: '/admin/payment-logs',
        icon: FileText,
    },
    {
        title: 'Shipments',
        href: '/admin/shipments',
        icon: Truck,
    },
    {
        title: 'Vouchers',
        href: '/admin/vouchers',
        icon: CircleDollarSign,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
    },
    {
        title: 'Addresses',
        href: '/admin/customer-addresses',
        icon: Home,
    },
    {
        title: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
    },
    {
        title: 'Banners',
        href: '/admin/banners',
        icon: Image,
    },
    {
        title: 'Pages',
        href: '/admin/pages',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: BarChart3,
    },
];


export function AppSidebar() {
    const { url } = usePage();
    const isAdmin = url.startsWith('/admin');
    const navItems = isAdmin ? adminNavItems : mainNavItems;
    const homeHref = isAdmin ? '/admin/dashboard' : dashboard();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
