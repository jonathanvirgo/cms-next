'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Zap,
    Tag,
    FolderOpen,
    Shield,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    badge?: string;
}

const contentItems: NavItem[] = [
    { icon: FileText, label: "Posts", href: "/posts" },
    { icon: FolderOpen, label: "Categories", href: "/categories" },
    { icon: Tag, label: "Tags", href: "/tags" },
];

const managementItems: NavItem[] = [
    { icon: Users, label: "Users", href: "/users" },
    { icon: Shield, label: "Roles", href: "/roles" },
];

export function DashboardSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<string[]>(() => {
        if (contentItems.some(item => pathname.startsWith(item.href))) return ["content"];
        if (managementItems.some(item => pathname.startsWith(item.href))) return ["management"];
        return ["content", "management"];
    });

    const toggleGroup = (group: string) => {
        setOpenGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const renderNavItem = (item: NavItem) => (
        <Link
            key={item.href}
            href={item.href}
            className={cn(
                "w-full sidebar-item group",
                pathname.startsWith(item.href) && "sidebar-item-active"
            )}
        >
            <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                pathname.startsWith(item.href) ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
            )} />
            {!collapsed && (
                <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );

    const renderCollapsibleGroup = (groupKey: string, groupLabel: string, GroupIcon: LucideIcon, items: NavItem[]) => (
        <Collapsible
            open={!collapsed && openGroups.includes(groupKey)}
            onOpenChange={() => !collapsed && toggleGroup(groupKey)}
        >
            <CollapsibleTrigger asChild>
                <button
                    className={cn(
                        "w-full sidebar-item group",
                        openGroups.includes(groupKey) && !collapsed && "bg-sidebar-accent"
                    )}
                >
                    <GroupIcon className="w-5 h-5 flex-shrink-0 text-sidebar-foreground group-hover:text-foreground" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left text-sm font-medium">{groupLabel}</span>
                            <ChevronDown className={cn(
                                "w-4 h-4 transition-transform text-muted-foreground",
                                openGroups.includes(groupKey) && "rotate-180"
                            )} />
                        </>
                    )}
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-1">
                {items.map(item => renderNavItem(item))}
            </CollapsibleContent>
        </Collapsible>
    );

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-foreground text-lg">CMS</span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {/* Dashboard */}
                <div className="mb-2">
                    {!collapsed && (
                        <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Main
                        </span>
                    )}
                </div>
                <Link
                    href="/"
                    className={cn(
                        "w-full sidebar-item group",
                        pathname === "/" && "sidebar-item-active"
                    )}
                >
                    <LayoutDashboard className={cn(
                        "w-5 h-5 flex-shrink-0",
                        pathname === "/" ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                    )} />
                    {!collapsed && (
                        <span className="flex-1 text-left text-sm font-medium">Dashboard</span>
                    )}
                </Link>

                <div className="my-4 border-t border-sidebar-border" />

                {/* Content Group */}
                <div className="mb-2">
                    {!collapsed && (
                        <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Content
                        </span>
                    )}
                </div>
                {renderCollapsibleGroup("content", "Content", FileText, contentItems)}

                <div className="my-4 border-t border-sidebar-border" />

                {/* Management Group */}
                <div className="mb-2">
                    {!collapsed && (
                        <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Management
                        </span>
                    )}
                </div>
                {renderCollapsibleGroup("management", "Management", Users, managementItems)}

                <div className="my-4 border-t border-sidebar-border" />

                {/* Settings */}
                <Link
                    href="/settings"
                    className={cn(
                        "w-full sidebar-item group",
                        pathname === "/settings" && "sidebar-item-active"
                    )}
                >
                    <Settings className={cn(
                        "w-5 h-5 flex-shrink-0",
                        pathname === "/settings" ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                    )} />
                    {!collapsed && (
                        <span className="flex-1 text-left text-sm font-medium">Settings</span>
                    )}
                </Link>
            </nav>

            {/* User Profile */}
            {!collapsed && (
                <div className="p-4 border-t border-sidebar-border">
                    <div className="glass-card p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">Admin</p>
                            <p className="text-xs text-muted-foreground truncate">Administrator</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
