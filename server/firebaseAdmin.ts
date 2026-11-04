import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import dotenv from 'dotenv';
dotenv.config();

const databaseURL = process.env.OMNITOOL_DATABASE_URL || "https://omnitool-backend-d8ce5-default-rtdb.firebaseio.com";

// Initialize Website Admin App for both token verification, Firestore, and Realtime Database
let websiteAdminApp: App;
try {
  if (!getApps().find(app => app?.name === '[DEFAULT]')) {
    const serviceAccountJson = process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      websiteAdminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store",
        databaseURL
      });
      console.log("Website Firebase Admin initialized with full Service Account credentials.");
    } else {
      console.warn("WARNING: WEBSITE_FIREBASE_SERVICE_ACCOUNT is not set. Using default application credentials. Database access might fail.");
      websiteAdminApp = initializeApp({
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store",
        databaseURL
      });
    }
  } else {
    websiteAdminApp = getApp();
  }
} catch (error) {
  console.error("Error initializing default firebase admin:", error);
  websiteAdminApp = getApp(); 
}

/**
 * Attempts to sync device sessions to Firebase Realtime Database at omnitool_users/{username}/sessions.
 * Non-blocking and catches any network or permission errors gracefully.
 */
export async function syncSessionsToRealtimeDb(username: string, sessions: Record<string, any>) {
  try {
    const rtdb = getDatabase(websiteAdminApp);
    await rtdb.ref(`omnitool_users/${username}/sessions`).set(sessions);
  } catch (err: any) {
    // Non-fatal if RTDB is unavailable or permissions are restricted to Firestore
    // console.warn("RTDB sync notice:", err.message);
  }
}

export { websiteAdminApp };
