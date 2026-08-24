import express from "express";
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for external clients (like OmniTool)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// -----------------------------------------------------
// UTILS
// -----------------------------------------------------
export function createCanonicalPayload(payload: {
  version: number;
  username: string;
  deviceId: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}) {
  return JSON.stringify({
    deviceId: payload.deviceId,
    expiresAt: payload.expiresAt,
    issuedAt: payload.issuedAt,
    token: payload.token,
    username: payload.username,
    version: payload.version
  });
}

export function signPayload(payloadString: string): string {
  const privateKey = process.env.OMNITOOL_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('OMNITOOL_PRIVATE_KEY environment variable is missing.');
  }
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(payloadString);
  sign.end();
  return sign.sign(formattedPrivateKey, 'base64');
}

// -----------------------------------------------------
// FIREBASE SETUP
// -----------------------------------------------------
let websiteAdminApp: any;
try {
  if (!getApps().length) {
    const serviceAccountJson = process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      websiteAdminApp = initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
    } else {
      websiteAdminApp = initializeApp({
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
    }
  } else {
    websiteAdminApp = getApp();
  }
} catch (error) {
  console.error("Firebase init error:", error);
  websiteAdminApp = getApp();
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

const verifyAdmin = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const authInstance = getAuth(websiteAdminApp);
    const decodedToken = await authInstance.verifyIdToken(token);
    
    const userEmail = decodedToken.email?.toLowerCase();
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      req.adminEmail = userEmail;
      return next();
    }
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// -----------------------------------------------------
// OMNITOOL EXTENSION AUTH ROUTES
// -----------------------------------------------------

app.post('/api/omnitool/login', async (req: any, res: any) => {
  const { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const db = getFirestore(websiteAdminApp);
    const cleanUsername = username.trim();
    const userDocRef = db.collection('omnitool_users').doc(cleanUsername);
    const userSnapshot = await userDocRef.get();
    
    if (!userSnapshot.exists) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const userData = userSnapshot.data()!;
    if (userData.status !== 'active') {
      return res.status(403).json({ error: "account_disabled" });
    }

    let isValid = false;
    
    if (userData.passwordHash) {
      isValid = await bcrypt.compare(password, userData.passwordHash);
    } else if (userData.password && userData.password === password) {
      isValid = true;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await userDocRef.update({
        passwordHash: hash,
        password: null
      });
    }

    if (!isValid) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const updatedAt = Date.now();
    const sessionData = { deviceId, token, updatedAt };

    await userDocRef.update({ activeSession: sessionData });

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000;
    const authorizationPayload = {
      version: 1,
      username: cleanUsername,
      deviceId,
      token,
      issuedAt,
      expiresAt
    };

    let signature = "";
    try {
      signature = signPayload(createCanonicalPayload(authorizationPayload));
    } catch (err: any) {
      console.error("RSA signing failed:", err);
      return res.status(500).json({ error: "internal_server_error_signing" });
    }

    return res.json({
      success: true,
      token,
      userId: cleanUsername,
      username: cleanUsername,
      status: userData.status,
      authorizationPayload,
      signature
    });
  } catch (error) {
    console.error("OmniTool login error:", error);
    return res.status(500).json({ error: "internal_server_error" });
  }
});

app.post('/api/omnitool/verify-session', async (req: any, res: any) => {
  const { username, token, deviceId } = req.body;
  if (!username || !token || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = getFirestore(websiteAdminApp);
    const cleanUsername = username.trim();
    const userSnapshot = await db.collection('omnitool_users').doc(cleanUsername).get();
    
    if (!userSnapshot.exists) {
      return res.status(401).json({ status: "account_not_found" });
    }

    const userData = userSnapshot.data()!;
    if (userData.status !== 'active') {
      return res.status(403).json({ status: "account_disabled" });
    }

    const session = userData.activeSession;
    if (!session || session.deviceId !== deviceId || session.token !== token) {
      return res.status(401).json({ status: "concurrent_login" });
    }

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000;
    const authorizationPayload = {
      version: 1,
      username: cleanUsername,
      deviceId,
      token,
      issuedAt,
      expiresAt
    };

    let signature = "";
    try {
      signature = signPayload(createCanonicalPayload(authorizationPayload));
    } catch (err: any) {
      console.error("RSA signing failed:", err);
      return res.status(500).json({ error: "internal_server_error_signing" });
    }

    return res.json({ 
       status: "valid", 
       valid: true,
      authorizationPayload,
      signature
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ error: "internal_server_error" });
  }
});

// -----------------------------------------------------
// ADMIN USER MANAGEMENT ROUTES
// -----------------------------------------------------

app.get('/api/omnitool/users', verifyAdmin, async (req: any, res: any) => {
  try {
    const db = getFirestore(websiteAdminApp);
    const snapshot = await db.collection('omnitool_users').get();
    
    if (snapshot.empty) {
      return res.json([]);
    }
    const usersList = snapshot.docs.map(doc => {
      const data = doc.data();
      const { password, passwordHash, ...rest } = data;
      return {
        id: doc.id,
        username: doc.id,
        hasPassword: !!(passwordHash || password),
        hashPreview: passwordHash ? `${passwordHash.substring(0, 15)}...` : null,
        ...rest
      };
    });
    return res.json(usersList);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post('/api/omnitool/users', verifyAdmin, async (req: any, res: any) => {
  const { username, password, status } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const cleanUsername = username.trim();
  if (/[.#$\[\]]/.test(cleanUsername)) {
    return res.status(400).json({ error: "Username contains invalid characters" });
  }

  try {
    const db = getFirestore(websiteAdminApp);
    const userRef = db.collection('omnitool_users').doc(cleanUsername);
    const snapshot = await userRef.get();
    
    if (snapshot.exists) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await userRef.set({
      passwordHash,
      status: status || 'active',
      createdAt: Date.now(),
      username: cleanUsername
    });
    return res.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

app.put('/api/omnitool/users/:id', verifyAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  const { status, password } = req.body;
  
  try {
    const db = getFirestore(websiteAdminApp);
    const userRef = db.collection('omnitool_users').doc(id);
    const snapshot = await userRef.get();
    
    if (!snapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const updates: any = {};
    if (status) updates.status = status;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
      updates.password = null;
    }
    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete('/api/omnitool/users/:id', verifyAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const db = getFirestore(websiteAdminApp);
    await db.collection('omnitool_users').doc(id).delete();
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post('/api/omnitool/users/bulk', verifyAdmin, async (req: any, res: any) => {
  const { action, userIds } = req.body;
  if (!action || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }
  try {
    const db = getFirestore(websiteAdminApp);
    const batch = db.batch();
    userIds.forEach((id: string) => {
      const userRef = db.collection('omnitool_users').doc(id);
      if (action === 'delete') {
        batch.delete(userRef);
      } else {
        batch.update(userRef, { status: action });
      }
    });
    await batch.commit();
    return res.json({ success: true });
  } catch (error) {
    console.error("Bulk action error:", error);
    return res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "Vercel Serverless Function is online (Ultimate Monolith Edition)" });
});

export default app;
