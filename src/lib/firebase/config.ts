import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAdxhMoFP3gKGB1_muHJOtSqjStw_HzvJc",
  authDomain: "smartlibz.firebaseapp.com",
  projectId: "smartlibz",
  storageBucket: "smartlibz.firebasestorage.app",
  messagingSenderId: "1099209948074",
  appId: "1:1099209948074:web:3249a5609618ef47a709d3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions };
