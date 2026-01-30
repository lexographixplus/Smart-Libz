"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import { useResources } from "@/lib/hooks/useResources";
import ResourceCard from "@/components/user/ResourceCard";
import { ResourceViewer } from "@/components/user/ResourceViewer";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function UserDashboard() {
    const { user } = useAuth();
    const { data: resources, isLoading } = useResources();
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedResource, setSelectedResource] = useState<any | null>(null);

    const handleDownload = (resource: any) => {
        if (resource.fileUrl) {
            const link = document.createElement('a');
            link.href = resource.fileUrl;
            link.download = resource.fileName || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredResources = resources?.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.displayName}</h1>
                    <p className="text-gray-500">Explore usage and resources.</p>
                </div>
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {filteredResources && filteredResources.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredResources.map((resource) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    onView={() => setSelectedResource(resource)}
                                    onDownload={resource.downloadAllowed ? handleDownload : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                            <p className="text-gray-500 text-lg">No resources found.</p>
                            <p className="text-sm text-gray-400 mt-1">Check back later for updates.</p>
                        </div>
                    )}
                </>
            )}

            <ResourceViewer
                resource={selectedResource}
                onClose={() => setSelectedResource(null)}
            />
        </div>
    );
}
