import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  User
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";

export interface UserProfileData {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  language?: string;
  theme?: string;
  discord?: string;
  telegram?: string;
  wishlist?: any[];
  createdAt?: any;
  updatedAt?: any;
}

// Instantiating the Google Auth Provider with sheets scope
export const googleProvider = new GoogleAuthProvider();

// Cache the access token in memory.
let cachedAccessToken: string | null = null;

/**
 * Clears any legacy unscoped profile keys and user-scoped caches on logout.
 * Guarantees that subsequent accounts on this browser start with zero residual data.
 */
export const clearUserLocalCache = () => {
  try {
    const legacyKeys = [
      "profile_name",
      "profile_handle",
      "profile_location",
      "profile_bio_text",
      "profile_discord",
      "profile_telegram",
      "profile_language",
      "profile_theme_color"
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));

    // Clear any user-scoped keys
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (key.startsWith("eh_user_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn("Storage purge notice:", e);
  }
};

/**
 * Ensures an authoritative profile document exists in Firestore for the given Firebase User.
 * CRITICAL: Enforces strict 1-to-1 relationship between User (UID) and Username.
 * If multiple username reservations exist for this UID, automatically deduplicates them.
 */
export const ensureUserProfile = async (user: User): Promise<UserProfileData> => {
  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  let existingData: Partial<UserProfileData> | null = null;
  if (userSnap.exists()) {
    existingData = userSnap.data() as UserProfileData;
  }

  // 1. Query all username reservations currently owned by this user's UID
  let ownedUsernames: { id: string; ref: any }[] = [];
  try {
    const unameQuery = query(collection(db, "usernames"), where("uid", "==", user.uid));
    const unameSnap = await getDocs(unameQuery);
    ownedUsernames = unameSnap.docs.map((d) => ({
      id: d.id,
      ref: d.ref,
    }));
  } catch (e) {
    console.warn("Could not query owned usernames:", e);
  }

  // 2. Determine the single authoritative username
  // Priority:
  // a) Existing username stored in users/{user.uid}
  // b) If none in users/{uid}, pick the existing username document owned by this UID
  // c) If none exists anywhere, generate from displayName/email
  let authoritativeUsername = existingData?.username?.trim().toLowerCase() || "";

  if (!authoritativeUsername && ownedUsernames.length > 0) {
    authoritativeUsername = ownedUsernames[0].id.toLowerCase();
  }

  if (!authoritativeUsername) {
    const rawBase = (user.displayName || user.email?.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 15) || `user_${user.uid.slice(0, 6)}`;

    let candidate = rawBase;
    try {
      const unameSnap = await getDoc(doc(db, "usernames", candidate));
      if (unameSnap.exists() && unameSnap.data()?.uid !== user.uid) {
        candidate = `${rawBase}_${user.uid.slice(0, 4)}`.toLowerCase();
      }
    } catch (e) {
      candidate = `${rawBase}_${user.uid.slice(0, 4)}`.toLowerCase();
    }
    authoritativeUsername = candidate;
  }

  // 3. Ensure the authoritative username document exists in usernames/
  try {
    await setDoc(
      doc(db, "usernames", authoritativeUsername),
      {
        uid: user.uid,
        email: user.email || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("Username reservation update notice:", e);
  }

  // 4. CRITICAL DEDUPLICATION:
  // If this UID owns any other username documents, delete them so there is strictly 1 username per user!
  for (const owned of ownedUsernames) {
    if (owned.id.toLowerCase() !== authoritativeUsername.toLowerCase()) {
      console.log(`Deduplicating: removing stale username doc "${owned.id}" for UID ${user.uid}`);
      await deleteDoc(owned.ref).catch((err) => {
        console.warn(`Failed to delete duplicate username doc "${owned.id}":`, err);
      });
    }
  }

  const resolvedProfile: UserProfileData = {
    uid: user.uid,
    displayName: existingData?.displayName || user.displayName || user.email?.split("@")[0] || "Editor",
    username: authoritativeUsername,
    email: existingData?.email || user.email || "",
    photoURL: existingData?.photoURL || user.photoURL || "",
    bio: existingData?.bio || "",
    location: existingData?.location || "",
    language: existingData?.language || "english",
    theme: existingData?.theme || "light",
    discord: existingData?.discord || "",
    telegram: existingData?.telegram || "",
    wishlist: existingData?.wishlist || [],
  };

  if (!userSnap.exists() || existingData?.username !== authoritativeUsername) {
    await setDoc(
      userDocRef,
      {
        ...resolvedProfile,
        updatedAt: serverTimestamp(),
        ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );
  }

  return resolvedProfile;
};

/**
 * Authoritatively retrieves a user profile from Firestore by UID
 */
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  if (!uid) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfileData;
    }
    return null;
  } catch (err) {
    console.error("Failed to load user profile:", err);
    return null;
  }
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const isDummyEmail = user.email?.endsWith("@editorshub.local");
      if (!isDummyEmail && !user.emailVerified) {
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
 * Perform Google Sign-In and initialize/verify authoritative user profile in Firestore
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string; profile: UserProfileData } | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn("No Google Sheets access token returned; checking if already authenticated or fallback.");
    }
    cachedAccessToken = credential?.accessToken || null;

    // Authoritatively bootstrap or read the user's Firestore profile
    const profile = await ensureUserProfile(result.user);

    return { user: result.user, accessToken: cachedAccessToken || "", profile };
  } catch (error: any) {
    console.error("Google Sign in error:", error);
    throw error;
  }
};

export const checkUsernameAvailability = async (username: string, currentUid?: string): Promise<boolean> => {
  if (!username) return false;
  try {
    const clean = username.toLowerCase().trim();
    const docRef = doc(db, "usernames", clean);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return true;
    if (currentUid && docSnap.data()?.uid === currentUid) return true;
    return false;
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
};

/**
 * Standard Email/Password Sign Up
 */
export const emailSignUp = async (
  email: string, 
  password: string, 
  displayName: string, 
  username: string = "", 
  bio: string = "",
  location: string = "",
  discord: string = "",
  telegram: string = ""
): Promise<User> => {
  try {
    if (username) {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error("Username is already taken");
      }
    }

    const isDummyEmail = email.endsWith("@editorshub.local");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername) {
      await setDoc(doc(db, "usernames", cleanUsername), {
        email,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    }

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      username: cleanUsername,
      displayName,
      email,
      bio: bio || "",
      location: location || "",
      discord: discord || "",
      telegram: telegram || "",
      language: "english",
      theme: "light",
      wishlist: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if (!isDummyEmail) {
      await sendEmailVerification(user);
    }
    
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

    const isDummyEmail = email.endsWith("@editorshub.local");
    if (!isDummyEmail && !user.emailVerified) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    // Authoritatively ensure profile document is present
    await ensureUserProfile(user);

    return user;
  } catch (error: any) {
    console.error("Email sign in error:", error);
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      throw new Error("Invalid email or password");
    }
    throw error;
  }
};

export const resendVerificationEmail = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await signOut(auth);
  } catch (error: any) {
    console.error("Resend verification error:", error);
    throw error;
  }
};

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
 * Signs out and clears cached tokens and local user data
 */
export const logout = async (): Promise<void> => {
  clearUserLocalCache();
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

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Global database sanitation: finds any UID or email that owns more than one username document,
 * checks their authoritative user document in `users/{uid}`, and deletes all orphaned username documents.
 */
export const cleanupAllStaleUsernames = async (): Promise<{ deletedCount: number; report: string[] }> => {
  const report: string[] = [];
  let deletedCount = 0;
  try {
    const unamesSnap = await getDocs(collection(db, "usernames"));
    const byUid: Record<string, { id: string; ref: any; email?: string }[]> = {};

    unamesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = data.uid || "";
      if (uid) {
        if (!byUid[uid]) byUid[uid] = [];
        byUid[uid].push({ id: docSnap.id, ref: docSnap.ref, email: data.email });
      }
    });

    for (const [uid, list] of Object.entries(byUid)) {
      if (list.length > 1) {
        // Query users/{uid} for the active username
        const uDoc = await getDoc(doc(db, "users", uid));
        let activeUsername = "";
        if (uDoc.exists()) {
          activeUsername = (uDoc.data().username || "").trim().toLowerCase();
        }
        if (!activeUsername) {
          activeUsername = list[list.length - 1].id.toLowerCase();
        }

        for (const item of list) {
          if (item.id.toLowerCase() !== activeUsername) {
            try {
              await deleteDoc(item.ref);
              deletedCount++;
              report.push(`Deleted duplicate username "${item.id}" for UID ${uid} (${item.email})`);
              console.log(`[Deduplicate] Removed orphan username "${item.id}" for UID ${uid}`);
            } catch (err) {
              console.warn(`Failed to delete "${item.id}":`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in cleanupAllStaleUsernames:", err);
  }
  return { deletedCount, report };
};

