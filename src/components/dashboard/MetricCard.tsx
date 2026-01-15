'use client'

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: LucideIcon;
    iconColor?: string;
    description?: string;
}

export function MetricCard({
    title,
    value,
    change,
    changeLabel = "vs last month",
    icon: Icon,
    iconColor = "text-primary",
    description,
}: MetricCardProps) {
    const isPositive = change !== undefined ? change >= 0 : undefined;

    return (
        <div className="metric-card animate-fade-in group">
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                    iconColor === "text-primary" && "bg-primary/10",
                    iconColor === "text-success" && "bg-success/10",
                    iconColor === "text-warning" && "bg-warning/10",
                    iconColor === "text-destructive" && "bg-destructive/10",
                    iconColor === "text-accent" && "bg-accent/10"
                )}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        isPositive ? "text-success" : "text-destructive"
                    )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-muted-foreground text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {(changeLabel && change !== undefined) && (
                    <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
                )}
                {description && !change && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
}
