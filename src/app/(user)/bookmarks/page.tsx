"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import { useResources } from "@/lib/hooks/useResources";
import { useBookmarks } from "@/lib/hooks/useBookmarks";
import ResourceCard from "@/components/user/ResourceCard";
import { ResourceViewer } from "@/components/user/ResourceViewer";
import { Loader2, Bookmark } from "lucide-react";
import { useState } from "react";

export default function BookmarksPage() {
    const { user } = useAuth();
    const { data: resources, isLoading: loadingResources } = useResources();
    const { bookmarkIds, isLoading: loadingBookmarks } = useBookmarks();
    const [selectedResource, setSelectedResource] = useState<any | null>(null);

    const bookmarkedResources = resources?.filter(r => bookmarkIds.includes(r.id));
    const isLoading = loadingResources || loadingBookmarks;

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
                <p className="text-gray-500">Quick access to your saved resources.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {bookmarkedResources && bookmarkedResources.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {bookmarkedResources.map((resource) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    onView={() => setSelectedResource(resource)}
                                    onDownload={resource.downloadAllowed ? handleDownload : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed flex flex-col items-center">
                            <Bookmark className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-gray-500 text-lg">No bookmarks yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Bookmark resources to see them here.</p>
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
