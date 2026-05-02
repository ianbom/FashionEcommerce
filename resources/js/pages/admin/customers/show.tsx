import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Heart,
    MapPin,
    Power,
    ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ActiveBadge,
    formatPrice,
    MetricCard,
    PageHeader,
    ReadBadge,
    Thumbnail,
} from '@/pages/admin/marketing/shared';
import { StatusBadge } from '@/pages/admin/sales/shared';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    orders_count: number;
    addresses_count: number;
    wishlists_count: number;
    notifications_count: number;
    total_spent: string | number;
    registered_at: string | null;
    last_order_at: string | null;
    addresses: {
        id: number;
        label: string | null;
        recipient_name: string;
        city: string;
        full_address: string;
        is_default: boolean;
    }[];
    orders: {
        id: number;
        order_number: string;
        grand_total: string;
        payment_status: string;
        order_status: string;
        shipping_status: string;
        created_at: string | null;
    }[];
    wishlists: {
        id: number;
        product_id: number;
        product_name: string | null;
        product_image: string | null;
        created_at: string | null;
    }[];
    notifications: {
        id: number;
        title: string;
        type: string;
        is_read: boolean;
        created_at: string | null;
    }[];
};

type Props = { customer: Customer };

export default function CustomerShow({ customer }: Props) {
    return (
        <>
            <Head title={customer.name} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Customer Management"
                    title={customer.name}
                    description={`${customer.email} · ${customer.phone ?? 'No phone'} · registered ${customer.registered_at ?? '-'}`}
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/customers">
                                    <ArrowLeft /> Back
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href={`/admin/customers/${customer.id}/toggle-active`}
                                    method="post"
                                    as="button"
                                >
                                    <Power /> Toggle Active
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 md:grid-cols-4">
                    <MetricCard
                        label="Total Spent"
                        value={formatPrice(customer.total_spent)}
                    />
                    <MetricCard label="Orders" value={customer.orders_count} />
                    <MetricCard
                        label="Wishlist"
                        value={customer.wishlists_count}
                    />
                    <MetricCard
                        label="Status"
                        value={<ActiveBadge active={customer.is_active} />}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="size-4" /> Addresses
                            </CardTitle>
                            <CardDescription>
                                {customer.addresses_count} saved address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {customer.addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="rounded-lg border p-4 text-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">
                                            {address.label ??
                                                address.recipient_name}
                                        </span>
                                        {address.is_default ? (
                                            <ActiveBadge active />
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-muted-foreground">
                                        {address.city}
                                    </p>
                                    <p className="mt-2">
                                        {address.full_address}
                                    </p>
                                    <Button
                                        asChild
                                        className="mt-3"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Link
                                            href={`/admin/customer-addresses/${address.id}`}
                                        >
                                            Open Address
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="size-4" /> Order History
                            </CardTitle>
                            <CardDescription>
                                Last order: {customer.last_order_at ?? '-'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    {customer.orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="py-3 pr-4">
                                                <Link
                                                    className="font-medium text-primary underline"
                                                    href={`/admin/orders/${order.id}`}
                                                >
                                                    {order.order_number}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.created_at}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {formatPrice(order.grand_total)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <StatusBadge
                                                    status={
                                                        order.payment_status
                                                    }
                                                />
                                            </td>
                                            <td className="py-3">
                                                <StatusBadge
                                                    status={order.order_status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="size-4" /> Wishlist Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {customer.wishlists.map((wishlist) => (
                                <div
                                    key={wishlist.id}
                                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                                >
                                    <Thumbnail
                                        src={wishlist.product_image}
                                        alt={wishlist.product_name ?? 'Product'}
                                    />
                                    <div>
                                        <div className="font-medium">
                                            {wishlist.product_name ?? '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {wishlist.created_at ?? '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="size-4" /> Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {customer.notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="rounded-lg border p-3 text-sm"
                                >
                                    <div className="flex justify-between gap-3">
                                        <span className="font-medium">
                                            {notification.title}
                                        </span>
                                        <ReadBadge
                                            read={notification.is_read}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {notification.type} ·{' '}
                                        {notification.created_at ?? '-'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
