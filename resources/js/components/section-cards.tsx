import { TrendingUpIcon, ShoppingBagIcon, PackageCheckIcon, CircleDollarSignIcon, UsersIcon } from "lucide-react"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const cards = [
    {
        title: "Total Revenue",
        value: "Rp 48.250.000",
        change: "+12.5%",
        trend: "up",
        description: "vs last month",
        icon: CircleDollarSignIcon,
    },
    {
        title: "Total Orders",
        value: "1.284",
        change: "+8.2%",
        trend: "up",
        description: "vs last month",
        icon: ShoppingBagIcon,
    },
    {
        title: "Orders Completed",
        value: "1.052",
        change: "+4.7%",
        trend: "up",
        description: "82% completion rate",
        icon: PackageCheckIcon,
    },
    {
        title: "New Customers",
        value: "324",
        change: "+18.1%",
        trend: "up",
        description: "vs last month",
        icon: UsersIcon,
    },
]

export function SectionCards() {
    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:from-primary/10 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
            {cards.map((card) => {
                const Icon = card.icon

                return (
                    <Card key={card.title} className="@container/card" data-slot="card">
                        <CardHeader className="relative">
                            <CardDescription>{card.title}</CardDescription>
                            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                                {card.value}
                            </CardTitle>
                            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1 text-sm">
                            <div className="flex items-center gap-2 font-medium leading-none">
                                <TrendingUpIcon className="size-4 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">{card.change}</span>
                                <span className="text-muted-foreground">{card.description}</span>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
