"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile
            await updateProfile(user, { displayName: name });

            // 3. Create Organization
            // TODO: Logic to check if org name exists or just generate generic ID?
            // Generating ID automatically by using doc() without path
            const orgRef = doc(collection(db, "organizations"));
            const orgId = orgRef.id;

            await setDoc(orgRef, {
                name: orgName,
                planType: "free", // Default plan
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: "active",
                usage: {
                    currentUsers: 1, // The admin themselves
                    currentAdmins: 1,
                    currentStorage: 0,
                    currentResources: 0
                },
                limits: { // Hardcoded default free limits for now
                    maxUsers: 50,
                    maxAdmins: 1,
                    maxStorage: 1024 * 1024 * 1024, // 1GB
                    maxResources: 100
                }
            });

            // 4. Create User Document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                displayName: name,
                role: "admin", // First user is Admin
                organizationId: orgId,
                status: "active",
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Start your free trial today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                />

                <Input
                    label="Organization Name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Acme Corp"
                />

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                />

                <Button type="submit" className="w-full" isLoading={loading}>
                    Create Account
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                </Link>
            </div>
        </Card>
    );
}


