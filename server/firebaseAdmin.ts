import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Website Admin App for both token verification AND Firestore database access
let websiteAdminApp: App;
try {
  if (!getApps().find(app => app?.name === '[DEFAULT]')) {
    const serviceAccountJson = process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      websiteAdminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
      console.log("Website Firebase Admin initialized with full Service Account credentials.");
    } else {
      console.warn("WARNING: WEBSITE_FIREBASE_SERVICE_ACCOUNT is not set. Using default application credentials. Database access might fail.");
      websiteAdminApp = initializeApp({
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
    }
  } else {
    websiteAdminApp = getApp();
  }
} catch (error) {
  console.error("Error initializing default firebase admin:", error);
  websiteAdminApp = getApp(); 
}

export { websiteAdminApp };
