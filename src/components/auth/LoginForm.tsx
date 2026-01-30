"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AuthProvider will pick up the user state change and redirect if needed
            // But we can also push to dashboard here
            router.push("/dashboard"); // Or check role and redirect
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password.");
            } else {
                setError(err.message || "Failed to login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

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
                />

                <Button type="submit" className="w-full" isLoading={loading}>
                    Sign In
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                </Link>
            </div>
        </Card>
    );
}
