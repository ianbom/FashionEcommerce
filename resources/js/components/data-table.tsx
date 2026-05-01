import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type Order = {
    id: string
    customer: string
    product: string
    date: string
    status: string
    amount: number
}

type Props = {
    data: Order[]
}

const statusClass: Record<string, string> = {
    Delivered: "bg-green-100 text-green-700 border-green-200",
    Shipped: "bg-blue-100 text-blue-700 border-blue-200",
    Processing: "bg-amber-100 text-amber-700 border-amber-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Canceled: "bg-red-100 text-red-700 border-red-200",
}

const formatPrice = (n: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(n)}`

export function DataTable({ data }: Props) {
    return (
        <Card className="mx-4 lg:mx-6">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                    Latest {data.length} orders across all customers
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="pb-3 pr-4 font-medium">Order ID</th>
                                <th className="pb-3 pr-4 font-medium">Customer</th>
                                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Product</th>
                                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Date</th>
                                <th className="pb-3 pr-4 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.map((row) => (
                                <tr key={row.id} className="group hover:bg-muted/40 transition-colors">
                                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                                        {row.id}
                                    </td>
                                    <td className="py-3 pr-4 font-medium">{row.customer}</td>
                                    <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell truncate max-w-[160px]">
                                        {row.product}
                                    </td>
                                    <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">
                                        {new Date(row.date).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusClass[row.status] ?? ""}`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-semibold">
                                        {formatPrice(row.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
