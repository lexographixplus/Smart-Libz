"use client";

import { useAuth } from "@/lib/context/AuthProvider";
import { ReactNode } from "react";
// In a real app, you might fetch organization details to get live usage
// For now, we'll assume usage is passed or we fetch it here.
// But to keep it simple, this component will wrap features and check basic role/plan if available in context.

interface PlanGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    // Define what limit we are checking
    feature?: "storage" | "users" | "admins";
}

export default function PlanGuard({ children, fallback, feature }: PlanGuardProps) {
    const { user, loading } = useAuth();

    if (loading) return null;

    // TODO: Implement actual plan checking logic against organization limits
    // For now, allow everything or check simple conditions
    const isAllowed = true;

    if (!isAllowed) {
        return fallback || null;
    }

    return <>{children}</>;
}
