'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ChartDataPoint {
    month: string;
    revenue: number;
    orders: number;
}

const mockData: ChartDataPoint[] = [
    { month: 'Jan', revenue: 4200, orders: 120 },
    { month: 'Feb', revenue: 5100, orders: 145 },
    { month: 'Mar', revenue: 4800, orders: 132 },
    { month: 'Apr', revenue: 6200, orders: 178 },
    { month: 'May', revenue: 7100, orders: 195 },
    { month: 'Jun', revenue: 6800, orders: 188 },
];

interface RevenueChartProps {
    data?: ChartDataPoint[];
    className?: string;
}

export function RevenueChart({ data = mockData, className }: RevenueChartProps) {
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgGrowth = 12.5; // Mock growth percentage

    return (
        <Card className={cn("glass-card", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Revenue Overview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Monthly revenue performance</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{avgGrowth}%</span>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                        <p className="text-xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                        <p className="text-xl font-bold text-foreground">{data.reduce((sum, d) => sum + d.orders, 0)}</p>
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div
                            key={item.month}
                            className="flex items-center gap-3 animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <span className="w-8 text-xs text-muted-foreground">{item.month}</span>
                            <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${(item.revenue / maxRevenue) * 100}%`,
                                        background: 'var(--gradient-primary)',
                                    }}
                                />
                            </div>
                            <span className="w-16 text-xs text-right font-medium">${item.revenue}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
