import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar />
            <div className="pl-64 transition-all duration-300">
                <DashboardHeader />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
