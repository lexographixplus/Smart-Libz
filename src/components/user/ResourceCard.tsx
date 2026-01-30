"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BookmarkButton } from "./BookmarkButton";
import {
    FileText,
    Video as VideoIcon,
    Image as ImageIcon,
    ExternalLink,
    Download,
    Eye,
    Play,
    Youtube
} from "lucide-react";

interface Resource {
    id: string;
    title: string;
    description: string;
    type: "pdf" | "doc" | "video" | "image" | "youtube";
    fileUrl?: string;
    youtubeUrl?: string;
    thumbnailUrl?: string;
    downloadAllowed?: boolean;
}

interface ResourceCardProps {
    resource: Resource;
    onView: (resource: Resource) => void;
    onDownload?: (resource: Resource) => void;
}

export default function ResourceCard({ resource, onView, onDownload }: ResourceCardProps) {
    const getIcon = () => {
        switch (resource.type) {
            case "pdf": return <FileText className="h-8 w-8 text-red-500" />;
            case "video": return <Play className="h-8 w-8 text-blue-500" />;
            case "youtube": return <Youtube className="h-8 w-8 text-red-600" />;
            case "image": return <ImageIcon className="h-8 w-8 text-green-500" />;
            default: return <FileText className="h-8 w-8 text-gray-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "pdf": return "bg-red-50 text-red-600";
            case "video": return "bg-blue-50 text-blue-600";
            case "youtube": return "bg-red-50 text-red-600";
            case "image": return "bg-green-50 text-green-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="aspect-video w-full bg-gray-100 flex items-center justify-center relative group cursor-pointer" onClick={() => onView(resource)}>
                {getIcon()}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    {(resource.type === "video" || resource.type === "youtube") && (
                        <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" />
                    )}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1" title={resource.title}>{resource.title}</h3>
                    <BookmarkButton resourceId={resource.id} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{resource.description}</p>

                <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={() => onView(resource)}>
                        <Eye className="h-4 w-4" />
                        View
                    </Button>
                    {onDownload && resource.type !== "youtube" && (
                        <Button size="sm" variant="ghost" onClick={() => onDownload(resource)} title="Download">
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
