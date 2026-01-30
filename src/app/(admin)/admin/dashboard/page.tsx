import { Card } from "@/components/ui/Card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - Resource Hub Admin",
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Quick Stats Cards */}
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Resources</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">1</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0 MB</p>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-[300px] p-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <div className="mt-4 flex items-center justify-center text-gray-500">
                        No activity yet
                    </div>
                </Card>
                <Card className="h-[300px] p-6">
                    <h3 className="text-lg font-medium text-gray-900">Popular Resources</h3>
                    <div className="mt-4 flex items-center justify-center text-gray-500">
                        No resources yet
                    </div>
                </Card>
            </div>
        </div>
    );
}
