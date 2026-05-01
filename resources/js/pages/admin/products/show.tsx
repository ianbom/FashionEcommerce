import { Head, Link } from '@inertiajs/react';
import { Archive, Copy, Edit, PackageCheck, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    FlagBadge,
    formatPrice,
    PageHeader,
    StatusBadge,
} from '@/pages/admin/catalog/shared';

type ProductImage = {
    id: number;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
};
type Variant = {
    id: number;
    sku: string;
    color_name: string | null;
    color_hex: string | null;
    size: string | null;
    additional_price: string;
    stock: number;
    reserved_stock: number;
    image_url: string | null;
    is_active: boolean;
};
type StockLog = {
    id: number;
    variant: string | null;
    type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    created_at: string | null;
};
type OrderItem = {
    id: number;
    order_id: number;
    quantity: number;
    subtotal: string;
    created_at: string | null;
};
type Product = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    category: string | null;
    collection: string | null;
    short_description: string | null;
    description: string | null;
    material: string | null;
    care_instruction: string | null;
    base_price: string;
    sale_price: string | null;
    weight: number;
    length: number | null;
    width: number | null;
    height: number | null;
    status: string;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    meta_title: string | null;
    meta_description: string | null;
    images: ProductImage[];
    variants: Variant[];
    orders: OrderItem[];
    stock_logs: StockLog[];
};

type Props = {
    product: Product;
};

export default function ProductShow({ product }: Props) {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

    return (
        <>
            <Head title={product.name} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={product.name}
                    description="Detail product admin: informasi utama, galeri, varian, stok, order history, dan SEO."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/admin/products/${product.id}/duplicate`} method="post" as="button">
                                    <Copy />
                                    Duplicate
                                </Link>
                            </Button>
                            {product.status !== 'published' ? (
                                <Button asChild>
                                    <Link href={`/admin/products/${product.id}/publish`} method="post" as="button">
                                        <Send />
                                        Publish
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link href={`/admin/products/${product.id}/archive`} method="post" as="button">
                                        <Archive />
                                        Archive
                                    </Link>
                                </Button>
                            )}
                            <Button asChild>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                    <Edit />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        ['Status', <StatusBadge key="status" status={product.status} />],
                        ['Total Stock', totalStock],
                        ['Base Price', formatPrice(product.base_price)],
                        ['Sale Price', product.sale_price ? formatPrice(product.sale_price) : '-'],
                    ].map(([label, value]) => (
                        <Card key={String(label)}>
                            <CardHeader>
                                <CardDescription>{label}</CardDescription>
                                <CardTitle className="text-2xl">{value}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Main Information</CardTitle>
                            <CardDescription>{product.slug}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Info label="SKU" value={product.sku ?? '-'} />
                            <Info label="Category" value={product.category ?? '-'} />
                            <Info label="Collection" value={product.collection ?? '-'} />
                            <Info label="Weight" value={`${product.weight} gram`} />
                            <Info label="Dimension" value={`${product.length ?? '-'} x ${product.width ?? '-'} x ${product.height ?? '-'} cm`} />
                            <Info label="Material" value={product.material ?? '-'} />
                            <div className="md:col-span-2">
                                <Info label="Short Description" value={product.short_description ?? '-'} />
                            </div>
                            <div className="md:col-span-2">
                                <Info label="Description" value={product.description ?? '-'} />
                            </div>
                            <div className="flex flex-wrap gap-2 md:col-span-2">
                                <FlagBadge active={product.is_featured}>Featured</FlagBadge>
                                <FlagBadge active={product.is_new_arrival}>New Arrival</FlagBadge>
                                <FlagBadge active={product.is_best_seller}>Best Seller</FlagBadge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Preview</CardTitle>
                            <CardDescription>Metadata halaman customer product.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border p-4">
                                <p className="text-sm font-medium">{product.meta_title || product.name}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {product.meta_description || product.short_description || 'No meta description.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gallery</CardTitle>
                        <CardDescription>{product.images.length} image tersimpan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {product.images.map((image) => (
                            <div key={image.id} className="rounded-lg border p-3">
                                <img src={image.image_url} alt={image.alt_text ?? product.name} className="aspect-square w-full rounded-md object-cover" />
                                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                                    <span className="text-muted-foreground">Sort {image.sort_order}</span>
                                    {image.is_primary ? <Badge>Primary</Badge> : null}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Variants</CardTitle>
                            <CardDescription>{product.variants.length} varian product.</CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={`/admin/product-variants/create?product_id=${product.id}`}>
                                <PackageCheck />
                                Add Variant
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">SKU</th>
                                    <th className="pb-3 pr-4 font-medium">Color</th>
                                    <th className="pb-3 pr-4 font-medium">Size</th>
                                    <th className="pb-3 pr-4 font-medium">Stock</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {product.variants.map((variant) => (
                                    <tr key={variant.id}>
                                        <td className="py-3 pr-4 font-medium">{variant.sku}</td>
                                        <td className="py-3 pr-4">{variant.color_name ?? '-'}</td>
                                        <td className="py-3 pr-4">{variant.size ?? '-'}</td>
                                        <td className="py-3 pr-4">{variant.stock - variant.reserved_stock} / {variant.stock}</td>
                                        <td className="py-3 pr-4"><ActiveBadge active={variant.is_active} /></td>
                                        <td className="py-3 text-right">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/admin/product-variants/${variant.id}/edit`}>Edit</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Stock Logs</CardTitle>
                            <CardDescription>10 perubahan stok terbaru untuk product ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {product.stock_logs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                    <div>
                                        <p className="font-medium">{log.variant} · {log.type}</p>
                                        <p className="text-muted-foreground">{log.created_at ?? '-'}</p>
                                    </div>
                                    <p className="font-medium">{log.stock_before} → {log.stock_after}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>Order items yang pernah memakai product ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {product.orders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                    <div>
                                        <p className="font-medium">Order #{order.order_id}</p>
                                        <p className="text-muted-foreground">{order.created_at ?? '-'}</p>
                                    </div>
                                    <p className="font-medium">{order.quantity} pcs · {formatPrice(order.subtotal)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}
