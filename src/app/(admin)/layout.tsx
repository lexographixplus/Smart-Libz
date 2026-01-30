"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/lib/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header */}
                    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                        <h1 className="text-lg font-semibold text-gray-800">
                            {/* Could implement dynamic breadcrumbs here */}
                            Admin Dashboard
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user?.displayName}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>

                    {/* Scrollable Content Area */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
