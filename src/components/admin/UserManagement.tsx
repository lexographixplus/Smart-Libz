"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthProvider";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { User, Shield, ShieldOff, Mail } from "lucide-react";

interface OrgUser {
    id: string;
    email: string;
    displayName: string;
    role: "admin" | "user";
    status: "active" | "disabled";
    lastLogin?: any;
}

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");

    const fetchUsers = async () => {
        if (!user?.organizationId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "users"),
                where("organizationId", "==", user.organizationId)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as OrgUser[];
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user?.organizationId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger a Cloud Function to send email
        alert(`Invitation feature simulating email to: ${inviteEmail}`);
        setInviteEmail("");
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        // Prevent removing last admin (logic needed)
        // Check limits (logic needed)

        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role. Insufficient permissions?");
        }
    };

    return (
        <div className="space-y-6">
            {/* Invite Section */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Invite Users
                </h2>
                <form onSubmit={handleInvite} className="flex gap-4 items-end">
                    <Input
                        label="Email Address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        type="email"
                        placeholder="colleague@example.com"
                        required
                    />
                    <div className="pb-1">
                        <Button type="submit">Send Invite</Button>
                    </div>
                </form>
            </Card>

            {/* User List */}
            <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    {u.displayName?.charAt(0) || <User className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <div>{u.displayName}</div>
                                                    <div className="text-gray-500 text-xs">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-600">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.id !== user?.uid && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRole(u.id, u.role)}
                                                    title={u.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                >
                                                    {u.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
