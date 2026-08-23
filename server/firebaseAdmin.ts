import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Website Admin App for token verification
let websiteAdminApp: App;
try {
  if (!getApps().find(app => app?.name === '[DEFAULT]')) {
    websiteAdminApp = initializeApp({
      projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
    });
    console.log("Website Firebase Admin initialized for token verification");
  } else {
    websiteAdminApp = getApp();
  }
} catch (error) {
  console.error("Error initializing default firebase admin:", error);
  websiteAdminApp = getApp(); 
}

// Initialize OmniTool Admin App for Realtime Database access
let omnitoolAdminApp: App | null = null;
try {
  if (!getApps().find(app => app?.name === 'omnitool')) {
    const serviceAccountJson = process.env.OMNITOOL_FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      omnitoolAdminApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.OMNITOOL_DATABASE_URL || "https://omnitool-backend-d8ce5-default-rtdb.firebaseio.com"
      }, 'omnitool');
      console.log("OmniTool Firebase Admin initialized");
    } else {
      console.warn("WARNING: OMNITOOL_FIREBASE_SERVICE_ACCOUNT is not set. OmniTool API endpoints will fail.");
    }
  } else {
    omnitoolAdminApp = getApp('omnitool');
  }
} catch (error) {
  console.error("Error initializing omnitool firebase admin:", error);
}

export { websiteAdminApp, omnitoolAdminApp };
