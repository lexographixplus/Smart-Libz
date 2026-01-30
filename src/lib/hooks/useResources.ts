import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/context/AuthProvider";

export function useResources(orgId?: string) {
    const { user } = useAuth();
    // Use passed orgId or user's orgId
    const effectiveOrgId = orgId || user?.organizationId;

    return useQuery({
        queryKey: ["resources", effectiveOrgId],
        queryFn: async () => {
            if (!effectiveOrgId) return [];

            // Query resources for this organization
            // For standard users, we might want to filter by visibility 'public' OR detailed access logic
            // For now, let's fetch all and filter in UI or trust rules (rules should block restricted ones)
            // Actually, Firestore requires composite index for multiple where+orderBy
            // We'll start simple: fetch recent

            const q = query(
                collection(db, "resources"),
                where("organizationId", "==", effectiveOrgId),
                // where("visibility", "==", "public"), // Uncomment if we enforce visibility at query level
                orderBy("createdAt", "desc"),
                limit(20)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[]; // Type as Resource[]
        },
        enabled: !!effectiveOrgId
    });
}
