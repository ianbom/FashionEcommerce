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
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Admin Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Catalog',
        items: [
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
        ],
    },
    {
        title: 'Sales',
        items: [
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
                title: 'Biteship Logs',
                href: '/admin/biteship-webhook-logs',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Customers',
        items: [
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
                title: 'Wishlist Insights',
                href: '/admin/wishlists',
                icon: Heart,
            },
        ],
    },
    {
        title: 'Marketing & Content',
        items: [
            {
                title: 'Vouchers',
                href: '/admin/vouchers',
                icon: CircleDollarSign,
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
        ],
    },
    {
        title: 'System',
        items: [
            {
                title: 'Settings',
                href: '/admin/settings',
                icon: Settings,
            },
            {
                title: 'Admin Users',
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
                                <AppLogo />
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
