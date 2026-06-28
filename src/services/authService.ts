import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  User, 
  Auth
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";

// Instantiating the Google Auth Provider with sheets scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/spreadsheets");

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;

// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!user.emailVerified) {
        await signOut(auth);
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
        return;
      }
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-In and fetch access token for Google Sheets API
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn("No Google Sheets access token returned; checking if already authenticated or fallback.");
    }

    cachedAccessToken = credential?.accessToken || null;

    // Log user registration to Firestore - Disabled as per requirements
    /*
    if (result.user) {
      await registerSignupInFirestore(
        result.user.uid,
        result.user.displayName || "Google Creator",
        result.user.email || "",
        "Google OAuth"
      );
    }
    */

    return { user: result.user, accessToken: cachedAccessToken || "" };
  } catch (error: any) {
    console.error("Google Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Standard Email/Password Sign Up
 */
export const emailSignUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });

    // Send verification email
    await sendEmailVerification(user);

    // Sign out immediately so they are not signed in automatically
    await signOut(auth);

    return user;
  } catch (error: any) {
    console.error("Email sign up error:", error);
    if (error.code === "auth/email-already-in-use") {
      throw new Error("User already exists. Please sign in");
    }
    throw error;
  }
};

/**
 * Standard Email/Password Sign In
 */
export const emailSignIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    return user;
  } catch (error: any) {
    console.error("Email sign in error:", error);
    if (error.message === "EMAIL_NOT_VERIFIED") {
      throw error;
    }
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-email"
    ) {
      throw new Error("Email or password is incorrect");
    }
    throw new Error("Email or password is incorrect");
  }
};

/**
 * Send password reset email
 */
export const sendForgotPasswordEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
      throw new Error("Invalid or unregistered email address");
    }
    throw error;
  }
};

/**
 * Signs out and clears cached tokens
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Returns cached Google Sheets OAuth access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Saves Google Sheets OAuth token manually (e.g. if passed down)
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export interface SignupRecord {
  id: string;
  name: string;
  email: string;
  date: string;
  provider: string;
  createdAt?: any;
}

/**
 * Register signup in Firestore db
 */
export async function registerSignupInFirestore(
  uid: string,
  name: string,
  email: string,
  provider: string
): Promise<void> {
  // Disabled as per requirements (Do NOT use Firestore or Storage yet)
}

/**
 * Fetch all signups from Firestore
 */
export async function getAllSignupsFromFirestore(): Promise<SignupRecord[]> {
  // Disabled as per requirements (Do NOT use Firestore or Storage yet)
  return [];
}
