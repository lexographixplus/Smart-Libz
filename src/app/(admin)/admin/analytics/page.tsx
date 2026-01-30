"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import { Card } from "@/components/ui/Card";
import { BarChart, Activity, Download, Eye, Users } from "lucide-react";

export default function AnalyticsPage() {
    const { user } = useAuth();

    const stats = [
        { name: 'Total Views', value: '12,345', change: '+12%', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Downloads', value: '4,567', change: '+5%', icon: Download, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Active Users', value: '89', change: '+18%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Storage Used', value: '45.2 GB', change: '+2%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500">Overview of resource performance and usage.</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <Card key={item.name} className="px-4 py-5 sm:p-6 overflow-hidden">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-md ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <div className="ml-5">
                                <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</dd>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Chart Placeholders */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6 h-80 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <BarChart className="h-12 w-12 mb-2" />
                    <p className="font-medium">Views Over Time</p>
                    <p className="text-xs">Chart integration coming soon</p>
                </Card>
                <Card className="p-6 h-80 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <Activity className="h-12 w-12 mb-2" />
                    <p className="font-medium">Storage Usage History</p>
                    <p className="text-xs">Chart integration coming soon</p>
                </Card>
            </div>
        </div>
    );
}
