"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { mapFirebaseUser, UserData } from "@/lib/firebase/auth";

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        if (auth.currentUser) {
            const userData = await mapFirebaseUser(auth.currentUser);
            setUser(userData);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Load user data from Firestore
                try {
                    const userData = await mapFirebaseUser(firebaseUser);
                    setUser(userData);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Fallback to basic auth data
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        role: "user",
                        organizationId: "",
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
