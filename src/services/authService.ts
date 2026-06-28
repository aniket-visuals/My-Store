import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
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

    // Log user registration to Firestore
    if (result.user) {
      await registerSignupInFirestore(
        result.user.uid,
        result.user.displayName || "Google Creator",
        result.user.email || "",
        "Google OAuth"
      );
    }

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

    // Log user registration to Firestore
    await registerSignupInFirestore(user.uid, displayName, email, "Email/Password");

    return user;
  } catch (error: any) {
    console.error("Email sign up error:", error);
    throw error;
  }
};

/**
 * Standard Email/Password Sign In
 */
export const emailSignIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Email sign in error:", error);
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
  try {
    const signupDoc = doc(db, "signups", uid);
    const signupData: SignupRecord = {
      id: uid,
      name,
      email,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      provider,
    };
    await setDoc(signupDoc, {
      ...signupData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write user to Firestore:", error);
  }
}

/**
 * Fetch all signups from Firestore
 */
export async function getAllSignupsFromFirestore(): Promise<SignupRecord[]> {
  try {
    const q = query(collection(db, "signups"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const signups: SignupRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      signups.push({
        id: docSnap.id,
        name: data.name,
        email: data.email,
        date: data.date,
        provider: data.provider,
      });
    });
    return signups;
  } catch (error) {
    console.error("Error reading signups:", error);
    return [];
  }
}
