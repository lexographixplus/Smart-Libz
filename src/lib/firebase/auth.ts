import { auth, db } from "./config";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Types
export type UserRole = "admin" | "contributor" | "user";

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    organizationId: string;
}

export const mapFirebaseUser = async (user: FirebaseUser): Promise<UserData> => {
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: data.role || "user",
            organizationId: data.organizationId || "",
        };
    } else {
        // If user document doesn't exist (shouldn't happen for fully registered users), return default
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "user",
            organizationId: "",
        };
    }
};
