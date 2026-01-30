"use client";

import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookmarkButtonProps {
    resourceId: string;
}

export function BookmarkButton({ resourceId }: BookmarkButtonProps) {
    const { isBookmarked, toggleBookmark, isToggling } = useBookmarks();
    const bookmarked = isBookmarked(resourceId);

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(resourceId);
            }}
            disabled={isToggling}
            className={bookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-600"}
        >
            <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </Button>
    );
}
