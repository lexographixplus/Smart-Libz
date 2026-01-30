import ResourceUpload from "@/components/admin/ResourceUpload";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Resources - Resource Hub",
};

export default function ResourcesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {/* TODO: Resource List Component */}
                    <div className="bg-white rounded-xl border p-6 shadow-sm">
                        <p className="text-gray-500 text-center">Resource List loading...</p>
                    </div>
                </div>
                <div>
                    <ResourceUpload />
                </div>
            </div>
        </div>
    );
}
