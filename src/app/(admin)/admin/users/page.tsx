import UserManagement from "@/components/admin/UserManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Users - Resource Hub Admin",
};

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500">Manage team access and roles.</p>

            <UserManagement />
        </div>
    );
}
