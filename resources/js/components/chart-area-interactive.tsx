'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const chartData = [
    { month: 'Jan', revenue: 18200000, orders: 342 },
    { month: 'Feb', revenue: 22500000, orders: 410 },
    { month: 'Mar', revenue: 19800000, orders: 378 },
    { month: 'Apr', revenue: 31200000, orders: 521 },
    { month: 'May', revenue: 27400000, orders: 468 },
    { month: 'Jun', revenue: 35600000, orders: 612 },
    { month: 'Jul', revenue: 29900000, orders: 534 },
    { month: 'Aug', revenue: 38200000, orders: 643 },
    { month: 'Sep', revenue: 41800000, orders: 712 },
    { month: 'Oct', revenue: 36500000, orders: 625 },
    { month: 'Nov', revenue: 44200000, orders: 758 },
    { month: 'Dec', revenue: 48250000, orders: 821 },
];

const formatRevenue = (value: number) => `Rp ${(value / 1000000).toFixed(1)}M`;

export function ChartAreaInteractive() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue & Orders Overview</CardTitle>
                <CardDescription>
                    Monthly revenue and order volume for 2026
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#4A2525"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#4A2525"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorOrders"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#B6574B"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#B6574B"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                        />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            yAxisId="revenue"
                            orientation="left"
                            tickFormatter={formatRevenue}
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={72}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                const numericValue = Number(value ?? 0);

                                return [
                                    name === 'revenue'
                                        ? formatRevenue(numericValue)
                                        : numericValue,
                                    name === 'revenue' ? 'Revenue' : 'Orders',
                                ];
                            }}
                            contentStyle={{
                                borderRadius: '8px',
                                fontSize: '12px',
                                border: '1px solid #EADBD8',
                            }}
                        />
                        <Area
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4A2525"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                        />
                        <Area
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke="#B6574B"
                            strokeWidth={2}
                            fill="url(#colorOrders)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center gap-6 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#4A2525]" />
                        Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#B6574B]" />
                        Orders
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
