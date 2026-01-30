import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthProvider";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBookmarks() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch bookmarks from user document
    const { data: bookmarkIds = [], isLoading } = useQuery({
        queryKey: ["bookmarks", user?.uid],
        queryFn: async () => {
            if (!user?.uid) return [];
            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                return (snapshot.data().bookmarks || []) as string[];
            }
            return [];
        },
        enabled: !!user?.uid,
    });

    // Toggle bookmark mutation
    const toggleBookmark = useMutation({
        mutationFn: async (resourceId: string) => {
            if (!user?.uid) throw new Error("Not authenticated");
            const userRef = doc(db, "users", user.uid);
            const isBookmarked = bookmarkIds.includes(resourceId);

            await updateDoc(userRef, {
                bookmarks: isBookmarked ? arrayRemove(resourceId) : arrayUnion(resourceId),
            });

            return { resourceId, added: !isBookmarked };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.uid] });
        },
    });

    return {
        bookmarkIds,
        isLoading,
        toggleBookmark: (id: string) => toggleBookmark.mutate(id),
        isBookmarked: (id: string) => bookmarkIds.includes(id),
        isToggling: toggleBookmark.isPending,
    };
}
