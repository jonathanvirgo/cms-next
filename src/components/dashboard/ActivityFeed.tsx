'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    type: 'create' | 'update' | 'delete' | 'publish';
}

const mockActivities: ActivityItem[] = [
    { id: '1', user: 'Admin', action: 'created', target: 'New Post', time: '2 minutes ago', type: 'create' },
    { id: '2', user: 'Editor', action: 'updated', target: 'Category Settings', time: '15 minutes ago', type: 'update' },
    { id: '3', user: 'Admin', action: 'published', target: 'Article: Getting Started', time: '1 hour ago', type: 'publish' },
    { id: '4', user: 'Moderator', action: 'deleted', target: 'Spam Comment', time: '2 hours ago', type: 'delete' },
    { id: '5', user: 'Admin', action: 'created', target: 'New User Account', time: '3 hours ago', type: 'create' },
];

const typeColors = {
    create: 'bg-success/20 text-success',
    update: 'bg-primary/20 text-primary',
    delete: 'bg-destructive/20 text-destructive',
    publish: 'bg-warning/20 text-warning',
};

interface ActivityFeedProps {
    activities?: ActivityItem[];
    className?: string;
}

export function ActivityFeed({ activities = mockActivities, className }: ActivityFeedProps) {
    return (
        <Card className={cn("glass-card", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                                typeColors[activity.type]
                            )}>
                                {activity.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium text-foreground">{activity.user}</span>
                                    {' '}
                                    <span className="text-muted-foreground">{activity.action}</span>
                                    {' '}
                                    <span className="font-medium text-foreground">{activity.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
