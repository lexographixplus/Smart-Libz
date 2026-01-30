"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";

interface Resource {
    id: string;
    title: string;
    type: string;
    fileUrl: string;
    youtubeUrl?: string;
}

interface ResourceViewerProps {
    resource: Resource | null;
    onClose: () => void;
}

export function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
    useEffect(() => {
        if (resource) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [resource]);

    if (!resource) return null;

    const renderContent = () => {
        switch (resource.type) {
            case 'video':
                return (
                    <video controls className="max-h-full max-w-full rounded-lg">
                        <source src={resource.fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'youtube':
                const youtubeId = resource.youtubeUrl?.split('v=')[1] || resource.youtubeUrl?.split('/').pop();
                return (
                    <iframe
                        className="w-full aspect-video rounded-lg"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={resource.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                );
            case 'pdf':
                return (
                    <iframe
                        src={`${resource.fileUrl}#toolbar=0`}
                        className="w-full h-full rounded-lg"
                        title={resource.title}
                    ></iframe>
                );
            case 'image':
                return (
                    <img src={resource.fileUrl} alt={resource.title} className="max-h-full max-w-full object-contain rounded-lg" />
                );
            default:
                return (
                    <div className="text-center p-12">
                        <p className="text-gray-500">Preview not available for this file type.</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.open(resource.fileUrl, '_blank')}>
                            Open in New Tab
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 truncate pr-8">{resource.title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center overflow-auto">
                    <div className="w-full h-full flex items-center justify-center">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
