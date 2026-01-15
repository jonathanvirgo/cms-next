'use client'

import { Users, FileText, FolderOpen, Tag, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { MetricCard, ActivityFeed, RevenueChart } from "@/components/dashboard";

export default function DashboardPage() {
    const { data: users } = trpc.user.list.useQuery();
    const { data: posts } = trpc.post.list.useQuery();
    const { data: categories } = trpc.category.list.useQuery();
    const { data: tags } = trpc.tag.list.useQuery();

    const metrics = [
        {
            title: "Total Users",
            value: users?.length || 0,
            icon: Users,
            iconColor: "text-primary",
            description: "Active user accounts",
        },
        {
            title: "Total Posts",
            value: posts?.length || 0,
            change: 12.5,
            changeLabel: "vs last month",
            icon: FileText,
            iconColor: "text-success",
        },
        {
            title: "Categories",
            value: categories?.length || 0,
            icon: FolderOpen,
            iconColor: "text-warning",
            description: "Content categories",
        },
        {
            title: "Tags",
            value: tags?.length || 0,
            change: 8.2,
            changeLabel: "vs last month",
            icon: Tag,
            iconColor: "text-accent",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your CMS Dashboard
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => (
                    <div key={metric.title} style={{ animationDelay: `${index * 100}ms` }}>
                        <MetricCard {...metric} />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <RevenueChart className="animate-slide-up" />

            {/* Bottom Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                    {/* Recent Posts Card */}
                    <div className="glass-card p-6 animate-fade-in">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Recent Posts
                        </h3>
                        {posts && posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.slice(0, 5).map((post, index) => (
                                    <div
                                        key={post.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                by {post.author.name} • {post.status}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'PUBLISHED'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No posts yet. Create your first post!</p>
                        )}
                    </div>
                </div>
                <ActivityFeed />
            </div>
        </div>
    );
}
