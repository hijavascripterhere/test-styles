/*

// firebase.js

// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// Firestore Database
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// Your Firebase configuration



const primaryConfig = {
    apiKey: "AIzaSyCGC8x0uwp58dvrE1hbf5WL8H7FDn2GqwI",
    authDomain: "ccgameo.firebaseapp.com",
    projectId: "ccgameo",
    storageBucket: "ccgameo.firebasestorage.app",
    messagingSenderId: "127950924798",
    appId: "1:127950924798:web:eee4d528d0582b484aaeaf",
    measurementId: "G-2E791HH9DL"
};

const backupConfig = {
    apiKey: "AIzaSyDgbwG110Xep88xyx06wfiAFLsnIb42000",
    authDomain: "backup-72b1c.firebaseapp.com",
    projectId: "backup-72b1c",
    storageBucket: "backup-72b1c.firebasestorage.app",
    messagingSenderId: "360487175293",
    appId: "1:360487175293:web:bd0c1d1356c2b697689d14",
    measurementId: "G-D6HQT10RH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Register a new account
export function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Login to an existing account
export function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// Send verification email
export function verifyEmail(user) {
    return sendEmailVerification(user);
}

// Reset password
export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

// Logout
export function logout() {
    return signOut(auth);
}

// Export authentication listener
export { onAuthStateChanged };

// Export Firestore functions
export {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
};
*/

// split

// firebase.js

// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// Firestore Database
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

// PRIMARY DATABASE
const primaryConfig = {
    apiKey: "AIzaSyCGC8x0uwp58dvrE1hbf5WL8H7FDn2GqwI",
    authDomain: "ccgameo.firebaseapp.com",
    projectId: "ccgameo",
    storageBucket: "ccgameo.firebasestorage.app",
    messagingSenderId: "127950924798",
    appId: "1:127950924798:web:eee4d528d0582b484aaeaf",
    measurementId: "G-2E791HH9DL"
};

// BACKUP DATABASE
const backupConfig = {
    apiKey: "AIzaSyDgbwG110Xep88xyx06wfiAFLsnIb42000",
    authDomain: "backup-72b1c.firebaseapp.com",
    projectId: "backup-72b1c",
    storageBucket: "backup-72b1c.firebasestorage.app",
    messagingSenderId: "360487175293",
    appId: "1:360487175293:web:bd0c1d1356c2b697689d14",
    measurementId: "G-D6HQT10RH3"
};

// Initialize both Firebase projects
const primaryApp = initializeApp(primaryConfig);
const backupApp = initializeApp(backupConfig, "backup");

// Authentication
export const auth = getAuth(primaryApp);
export const backupAuth = getAuth(backupApp);

// Databases
export const db = getFirestore(primaryApp);
export const backupDB = getFirestore(backupApp);

// Register
export async function register(email, password) {
    const user = await createUserWithEmailAndPassword(auth, email, password);

    await createUserWithEmailAndPassword(backupAuth, email, password);

    return user;
}

// Login
export async function login(email, password) {
    const user = await signInWithEmailAndPassword(auth, email, password);

    try {
        await signInWithEmailAndPassword(backupAuth, email, password);
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            await createUserWithEmailAndPassword(backupAuth, email, password);
        } else {
            throw error;
        }
    }

    return user;
}

// Send verification email
export function verifyEmail(user) {
    return sendEmailVerification(user);
}

// Reset password
export function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

// Logout
export async function logout() {
    await Promise.all([
        signOut(auth),
        signOut(backupAuth)
    ]);
}

// Authentication listener
export { onAuthStateChanged };

// Firestore functions
export {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
};
