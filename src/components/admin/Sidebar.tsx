"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    Tags,
    Settings,
    BarChart
} from "lucide-react";
import { cn } from "@/components/ui/Button"; // Reusing cn utility

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Resources", href: "/admin/resources", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-blue-600">Resource Hub</span>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-4">
                <div className="flex items-center">
                    {/* User profile snippet could go here */}
                    <div className="text-xs text-gray-500">Admin Console</div>
                </div>
            </div>
        </div>
    );
}
