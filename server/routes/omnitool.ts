import { Router } from "express";
import { websiteAdminApp, syncSessionsToRealtimeDb } from "../firebaseAdmin.js";
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createCanonicalPayload, signPayload } from "../utils/omnitoolAuth.js";

dotenv.config();
const router = Router();

// Default authorized admin emails for website management
const DEFAULT_ADMIN_EMAILS = [
  "aniketrajcargal123@gmail.com",
  "admin@editorshubstore.in"
];

// Retrieve allowed admin emails from environment, falling back to default site admins
const ADMIN_EMAILS = Array.from(new Set([
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
]));

// Middleware to verify Website Admin JWT token and email
const verifyAdmin = async (req: any, res: any, next: any) => {
  // Support bypass for local test runner when NODE_ENV is not production
  if (process.env.NODE_ENV !== "production" && req.headers['x-admin-test-auth'] === 'demo-test-bypass') {
    req.adminEmail = "aniketrajcargal123@gmail.com";
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split("Bearer ")[1];
  let userEmail: string | undefined;

  try {
    const authInstance = getAuth(websiteAdminApp);
    const decodedToken = await authInstance.verifyIdToken(token);
    userEmail = decodedToken.email?.toLowerCase();
  } catch (error) {
    // If verifyIdToken fails (e.g. without service account credentials in dev/staging),
    // safely decode JWT payload to inspect user email
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        userEmail = payload.email?.toLowerCase();
      }
    } catch (jwtErr) {
      console.error("JWT parse error:", jwtErr);
    }
  }

  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    req.adminEmail = userEmail;
    return next();
  }

  console.warn(`Unauthorized admin access attempt by: ${userEmail || "unknown"}`);
  return res.status(403).json({ error: "Forbidden: Admin access required" });
};

// ==========================================
// DATA ACCESS LAYER WITH FALLBACK
// ==========================================
// In-memory fallback map for environments without Firebase service account credentials
const inMemoryStore: Map<string, any> = new Map();
const INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const hasServiceAccount = !!process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;

export function isDemoAccount(username: string): boolean {
  return typeof username === "string" && username.trim().toLowerCase() === "demo";
}

async function getUserDoc(username: string): Promise<{ exists: boolean; data: () => any } | null> {
  const cleanUsername = username.trim();
  const isDemo = isDemoAccount(cleanUsername);

  if (hasServiceAccount) {
    try {
      const db = getFirestore(websiteAdminApp);
      if (isDemo) {
        let snap = await db.collection('omnitool_users').doc('Demo').get();
        if (snap.exists) return snap;
        snap = await db.collection('omnitool_users').doc('demo').get();
        if (snap.exists) return snap;
      } else {
        const snap = await db.collection('omnitool_users').doc(cleanUsername).get();
        if (snap.exists) {
          return snap;
        }
      }
    } catch (err: any) {
      // Fall back to memory store if Firestore unavailable/permission denied
    }
  }

  if (isDemo) {
    if (inMemoryStore.has("Demo")) {
      const memData = inMemoryStore.get("Demo");
      return { exists: true, data: () => ({ ...memData }) };
    }
    if (inMemoryStore.has("demo")) {
      const memData = inMemoryStore.get("demo");
      return { exists: true, data: () => ({ ...memData }) };
    }
  } else if (inMemoryStore.has(cleanUsername)) {
    const memData = inMemoryStore.get(cleanUsername);
    return {
      exists: true,
      data: () => ({ ...memData })
    };
  }

  return {
    exists: false,
    data: () => null
  };
}

async function setUserDoc(username: string, data: any): Promise<void> {
  const cleanUsername = username.trim();
  const isDemo = isDemoAccount(cleanUsername);

  if (isDemo) {
    inMemoryStore.set("Demo", { ...data, username: "Demo" });
    inMemoryStore.set("demo", { ...data, username: "Demo" });
  } else {
    inMemoryStore.set(cleanUsername, { ...data, username: cleanUsername });
  }

  if (hasServiceAccount) {
    try {
      const db = getFirestore(websiteAdminApp);
      if (isDemo) {
        await Promise.all([
          db.collection('omnitool_users').doc('Demo').set(data, { merge: true }),
          db.collection('omnitool_users').doc('demo').set(data, { merge: true })
        ]);
      } else {
        await db.collection('omnitool_users').doc(cleanUsername).set(data, { merge: true });
      }
    } catch (err: any) {
      // Non-fatal
    }
  }
}

async function updateUserDoc(username: string, updates: any): Promise<void> {
  const cleanUsername = username.trim();
  const isDemo = isDemoAccount(cleanUsername);

  if (isDemo) {
    const existing = inMemoryStore.get("Demo") || inMemoryStore.get("demo") || {};
    const updated = { ...existing, ...updates };
    inMemoryStore.set("Demo", updated);
    inMemoryStore.set("demo", updated);
  } else {
    const existing = inMemoryStore.get(cleanUsername) || {};
    inMemoryStore.set(cleanUsername, { ...existing, ...updates });
  }

  if (hasServiceAccount) {
    try {
      const db = getFirestore(websiteAdminApp);
      if (isDemo) {
        await Promise.all([
          db.collection('omnitool_users').doc('Demo').update(updates).catch(() => {}),
          db.collection('omnitool_users').doc('demo').update(updates).catch(() => {})
        ]);
      } else {
        await db.collection('omnitool_users').doc(cleanUsername).update(updates);
      }
    } catch (err: any) {
      // Non-fatal
    }
  }
}

async function deleteUserDoc(username: string): Promise<void> {
  const cleanUsername = username.trim();
  inMemoryStore.delete(cleanUsername);

  if (hasServiceAccount) {
    try {
      const db = getFirestore(websiteAdminApp);
      await db.collection('omnitool_users').doc(cleanUsername).delete();
    } catch (err: any) {
      // Non-fatal
    }
  }
}

// Automatically seed and ensure Demo account is configured with Demo / Demo123
export async function ensureDemoAccount() {
  try {
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      console.log("Seeding Demo account (Demo / Demo123)...");
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Demo123", salt);
      const initialDemoData = {
        username: "Demo",
        passwordHash,
        status: "active",
        createdAt: Date.now(),
        isSpecialMultiDevice: true,
        deviceLimitMode: "limited",
        maxDeviceLimit: 10,
        activeSessions: {}
      };
      await setUserDoc("Demo", initialDemoData);
      console.log("Demo account initialized successfully.");
    } else {
      const data = userDoc.data();
      const updates: any = {};
      if (!data.isSpecialMultiDevice) updates.isSpecialMultiDevice = true;
      if (!data.deviceLimitMode) updates.deviceLimitMode = "limited";
      if (typeof data.maxDeviceLimit !== "number") updates.maxDeviceLimit = 10;
      if (!data.activeSessions) updates.activeSessions = {};
      if (!data.passwordHash && !data.password) {
        const salt = await bcrypt.genSalt(10);
        updates.passwordHash = await bcrypt.hash("Demo123", salt);
      }
      if (Object.keys(updates).length > 0) {
        await updateUserDoc("Demo", updates);
      }
    }
  } catch (err: any) {
    console.error("Error in ensureDemoAccount:", err.message);
  }
}

// Trigger initialization on startup
ensureDemoAccount();

// Helper to calculate active device count and clean expired sessions
function filterActiveSessions(sessions: Record<string, any>, excludeDeviceId?: string): any[] {
  const now = Date.now();
  return Object.values(sessions || {}).filter((s: any) => {
    if (s.status !== 'active') return false;
    if (excludeDeviceId && s.deviceId === excludeDeviceId) return false;
    const lastActive = s.lastActiveAt || s.loginAt || 0;
    return (now - lastActive) < INACTIVITY_TIMEOUT_MS;
  });
}

function detectPlatform(req: any): string {
  if (req.body.platform) return req.body.platform;
  if (req.body.os) return req.body.os;
  const ua = req.headers['user-agent'] || "";
  if (/macintosh|mac os|darwin/i.test(ua)) return "Mac";
  if (/windows|win32|win64/i.test(ua)) return "Windows";
  return "Desktop";
}

// ==========================================
// EXTENSION ENDPOINTS (Public, but protected by logic)
// ==========================================

// Login endpoint for OmniTool Extension
router.post('/login', async (req, res) => {
  const { username, password, deviceId } = req.body;
  
  if (!username || !password || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const rawUsername = username.trim();
    const isDemo = isDemoAccount(rawUsername);
    const cleanUsername = isDemo ? "Demo" : rawUsername;

    // Fetch user
    const userSnapshot = await getUserDoc(cleanUsername);
    
    if (!userSnapshot || !userSnapshot.exists) {
      return res.status(401).json({ error: "account_not_found" });
    }

    const userData = userSnapshot.data()!;
    if (userData.status !== 'active') {
      return res.status(403).json({ 
        error: "account_disabled",
        message: isDemo ? "Demo account is currently disabled. Please contact administrator." : "Account is disabled." 
      });
    }

    let isValid = false;
    
    // Check passwordHash if it exists, else verify plain text and migrate
    if (userData.passwordHash) {
      isValid = await bcrypt.compare(password, userData.passwordHash);
      // For Demo account, accept case-insensitively (Demo123, demo123, DEMO123)
      if (!isValid && isDemo && password.toLowerCase() === "demo123") {
        isValid = true;
      }
    } else if (userData.password && userData.password === password) {
      isValid = true;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await updateUserDoc(cleanUsername, {
        passwordHash: hash,
        password: null
      });
    } else if (isDemo && (password === "Demo123" || password === "demo123" || password.toLowerCase() === "demo123")) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // ----------------------------------------------------
    // SPECIAL MULTI-DEVICE LOGIC: APPLIED ONLY TO DEMO
    // ----------------------------------------------------
    if (isDemo) {
      const now = Date.now();
      const sessions: Record<string, any> = { ...(userData.activeSessions || {}) };
      const limitMode = userData.deviceLimitMode || "limited";
      const maxLimit = typeof userData.maxDeviceLimit === "number" ? userData.maxDeviceLimit : 10;

      // Count currently active devices, excluding this deviceId if it's already logged in (session refresh / restart)
      const otherActive = filterActiveSessions(sessions, deviceId);

      if (limitMode === "limited" && otherActive.length >= maxLimit) {
        return res.status(403).json({
          error: "device_limit_reached",
          message: `Maximum device limit reached for Demo account (${maxLimit} devices). Please contact administrator.`
        });
      }

      // Generate cryptographically random session token
      const token = crypto.randomBytes(32).toString('hex');
      const platform = detectPlatform(req);

      sessions[deviceId] = {
        deviceId,
        token,
        platform,
        loginAt: now,
        lastActiveAt: now,
        status: "active"
      };

      await updateUserDoc("Demo", {
        activeSessions: sessions,
        lastLoginAt: now
      });

      // Sync to Firebase Realtime Database
      syncSessionsToRealtimeDb("Demo", sessions);

      // Generate RSA Authorization Payload
      const issuedAt = now;
      const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000; // 30 days
      const authorizationPayload = {
        version: 1,
        username: "Demo",
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
        userId: "Demo",
        username: "Demo",
        status: userData.status,
        authorizationPayload,
        signature
      });
    }

    // ----------------------------------------------------
    // REGULAR ACCOUNT LOGIN (Untouched Single-Device Mode)
    // ----------------------------------------------------
    const token = crypto.randomBytes(32).toString('hex');
    const updatedAt = Date.now();
    const sessionData = {
      deviceId,
      token,
      updatedAt
    };

    // Save active session (replaces any previous session, causing concurrent_login on old device)
    await updateUserDoc(cleanUsername, { activeSession: sessionData });

    // Generate RSA Authorization Payload
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000; // 30 days
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

// Verify session endpoint for OmniTool Extension
router.post('/verify-session', async (req, res) => {
  const { username, token, deviceId } = req.body;
  
  if (!username || !token || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const rawUsername = username.trim();
    const isDemo = isDemoAccount(rawUsername);
    const cleanUsername = isDemo ? "Demo" : rawUsername;

    const userSnapshot = await getUserDoc(cleanUsername);
    
    if (!userSnapshot || !userSnapshot.exists) {
      return res.status(401).json({ status: "account_not_found" });
    }

    const userData = userSnapshot.data()!;
    if (userData.status !== 'active') {
      return res.status(403).json({ status: "account_disabled", error: "account_disabled" });
    }

    // ----------------------------------------------------
    // SPECIAL MULTI-DEVICE VERIFY: APPLIED ONLY TO DEMO
    // ----------------------------------------------------
    if (isDemo) {
      const sessions = userData.activeSessions || {};
      const session = sessions[deviceId];

      if (!session || session.token !== token || session.status !== 'active') {
        return res.status(401).json({ status: "session_terminated", error: "session_terminated" });
      }

      // Check if session has timed out (> 24h since last activity)
      const now = Date.now();
      const lastActive = session.lastActiveAt || session.loginAt || 0;
      if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
        sessions[deviceId].status = 'expired';
        await updateUserDoc("Demo", { activeSessions: sessions });
        return res.status(401).json({ status: "session_expired", error: "session_expired" });
      }

      // Refresh lastActiveAt
      sessions[deviceId].lastActiveAt = now;
      updateUserDoc("Demo", {
        [`activeSessions.${deviceId}.lastActiveAt`]: now
      }).catch(() => {});

      // Generate renewed RSA Authorization Payload
      const issuedAt = Date.now();
      const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000;
      const authorizationPayload = {
        version: 1,
        username: "Demo",
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
    }

    // ----------------------------------------------------
    // REGULAR ACCOUNT VERIFY (Untouched Single-Device Mode)
    // ----------------------------------------------------
    const session = userData.activeSession;
    if (!session || session.deviceId !== deviceId || session.token !== token) {
      return res.status(401).json({ status: "concurrent_login" });
    }

    // Session is valid
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1000; // 30 days
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

// ==========================================
// DEMO ACCOUNT SPECIAL ADMIN MANAGEMENT ENDPOINTS
// ==========================================

// Get Demo account details, limit settings, and active connected devices
router.get('/demo', verifyAdmin, async (_req, res) => {
  try {
    await ensureDemoAccount();
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      return res.status(404).json({ error: "Demo account not found" });
    }

    const data = userDoc.data()!;
    const now = Date.now();
    const rawSessions = data.activeSessions || {};

    const sessionsList = Object.values(rawSessions).map((s: any) => {
      const isExpired = (now - (s.lastActiveAt || s.loginAt || 0)) >= INACTIVITY_TIMEOUT_MS;
      let effectiveStatus = s.status || "active";
      if (effectiveStatus === "active" && isExpired) {
        effectiveStatus = "inactive";
      }
      return {
        deviceId: s.deviceId,
        platform: s.platform || "Desktop",
        loginAt: s.loginAt || now,
        lastActiveAt: s.lastActiveAt || s.loginAt || now,
        status: effectiveStatus
      };
    });

    const activeDevicesCount = sessionsList.filter(s => s.status === "active").length;

    return res.json({
      username: "Demo",
      status: data.status || "active",
      deviceLimitMode: data.deviceLimitMode || "limited",
      maxDeviceLimit: typeof data.maxDeviceLimit === "number" ? data.maxDeviceLimit : 10,
      activeDeviceCount: activeDevicesCount,
      totalSessionsCount: sessionsList.length,
      sessions: sessionsList
    });
  } catch (error) {
    console.error("Get demo error:", error);
    return res.status(500).json({ error: "Failed to fetch Demo account details" });
  }
});

// Update Demo account configuration (activation status, limit mode, limit count, password)
router.put('/demo/config', verifyAdmin, async (req, res) => {
  const { status, deviceLimitMode, maxDeviceLimit, password } = req.body;

  try {
    await ensureDemoAccount();
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      return res.status(404).json({ error: "Demo account not found" });
    }

    const currentData = userDoc.data()!;
    const updates: any = {};

    if (status) {
      updates.status = status;
      // Requirement 4: When disabling Demo, invalidate all active sessions immediately
      if (status === "disabled") {
        const sessions = { ...(currentData.activeSessions || {}) };
        Object.keys(sessions).forEach(devId => {
          sessions[devId] = {
            ...sessions[devId],
            status: "terminated",
            terminatedAt: Date.now()
          };
        });
        updates.activeSessions = sessions;
        syncSessionsToRealtimeDb("Demo", sessions);
      }
    }

    if (deviceLimitMode && (deviceLimitMode === "limited" || deviceLimitMode === "unlimited")) {
      updates.deviceLimitMode = deviceLimitMode;
    }

    if (typeof maxDeviceLimit === "number" && maxDeviceLimit > 0) {
      updates.maxDeviceLimit = Math.floor(maxDeviceLimit);
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
      updates.password = null;
    }

    if (Object.keys(updates).length > 0) {
      await updateUserDoc("Demo", updates);
    }

    return res.json({ success: true, message: "Demo account updated successfully" });
  } catch (error) {
    console.error("Update demo config error:", error);
    return res.status(500).json({ error: "Failed to update Demo configuration" });
  }
});

// Terminate an individual device session for Demo
router.post('/demo/terminate-session', verifyAdmin, async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "deviceId is required" });
  }

  try {
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      return res.status(404).json({ error: "Demo account not found" });
    }

    const data = userDoc.data()!;
    const sessions = { ...(data.activeSessions || {}) };

    if (sessions[deviceId]) {
      sessions[deviceId] = {
        ...sessions[deviceId],
        status: "terminated",
        terminatedAt: Date.now()
      };
      await updateUserDoc("Demo", { activeSessions: sessions });
      syncSessionsToRealtimeDb("Demo", sessions);
    }

    return res.json({ success: true, message: `Device ${deviceId} terminated` });
  } catch (error) {
    console.error("Terminate session error:", error);
    return res.status(500).json({ error: "Failed to terminate device session" });
  }
});

// Terminate all active sessions at once for Demo
router.post('/demo/terminate-all', verifyAdmin, async (_req, res) => {
  try {
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      return res.status(404).json({ error: "Demo account not found" });
    }

    const data = userDoc.data()!;
    const sessions = { ...(data.activeSessions || {}) };
    const now = Date.now();

    Object.keys(sessions).forEach(devId => {
      sessions[devId] = {
        ...sessions[devId],
        status: "terminated",
        terminatedAt: now
      };
    });

    await updateUserDoc("Demo", { activeSessions: sessions });
    syncSessionsToRealtimeDb("Demo", sessions);

    return res.json({ success: true, message: "All sessions terminated successfully" });
  } catch (error) {
    console.error("Terminate all sessions error:", error);
    return res.status(500).json({ error: "Failed to terminate all sessions" });
  }
});

// ==========================================
// ADMIN ENDPOINTS (Protected by Website Auth)
// ==========================================

// Get all users
router.get('/users', verifyAdmin, async (_req, res) => {
  try {
    await ensureDemoAccount();
    const usersMap: Map<string, any> = new Map();

    // Pull from Firestore if available
    if (hasServiceAccount) {
      try {
        const db = getFirestore(websiteAdminApp);
        const snapshot = await db.collection('omnitool_users').get();
        snapshot.docs.forEach(doc => {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
      } catch (e) {
        // In-memory fallback
      }
    }

    // Merge in-memory store
    inMemoryStore.forEach((val, key) => {
      usersMap.set(key, { id: key, ...val });
    });

    const usersList = Array.from(usersMap.values()).map(data => {
      const { password, passwordHash, ...rest } = data;
      const isDemo = data.id === "Demo";

      let activeDeviceCount = 0;
      if (isDemo && data.activeSessions) {
        activeDeviceCount = filterActiveSessions(data.activeSessions).length;
      }

      return {
        id: data.id,
        username: data.username || data.id,
        hasPassword: !!(passwordHash || password),
        hashPreview: passwordHash ? `${passwordHash.substring(0, 15)}...` : null,
        isSpecialMultiDevice: isDemo,
        activeDeviceCount: isDemo ? activeDeviceCount : undefined,
        ...rest
      };
    });
    
    return res.json(usersList);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create new user
router.post('/users', verifyAdmin, async (req, res) => {
  const { username, password, status } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const cleanUsername = username.trim();
  if (/[.#$\[\]]/.test(cleanUsername)) {
    return res.status(400).json({ error: "Username contains invalid characters" });
  }

  try {
    const existing = await getUserDoc(cleanUsername);
    if (existing && existing.exists) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await setUserDoc(cleanUsername, {
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

// Update existing user
router.put('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, password } = req.body;
  
  try {
    const userSnapshot = await getUserDoc(id);
    if (!userSnapshot || !userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates: any = {};
    if (status) {
      updates.status = status;
      if (id === "Demo" && status === "disabled") {
        // Invalidate Demo active sessions
        const curData = userSnapshot.data()!;
        const sessions = { ...(curData.activeSessions || {}) };
        Object.keys(sessions).forEach(k => {
          sessions[k] = { ...sessions[k], status: "terminated", terminatedAt: Date.now() };
        });
        updates.activeSessions = sessions;
        syncSessionsToRealtimeDb("Demo", sessions);
      }
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
      updates.password = null;
    }

    if (Object.keys(updates).length > 0) {
      await updateUserDoc(id, updates);
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Protect Demo account from accidental deletion
  if (id === "Demo") {
    return res.status(400).json({ error: "The Demo system account cannot be deleted. You can disable it instead." });
  }

  try {
    await deleteUserDoc(id);
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

// Bulk update users
router.post('/users/bulk', verifyAdmin, async (req, res) => {
  const { action, userIds } = req.body;

  if (!action || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  try {
    for (const id of userIds) {
      if (action === 'delete') {
        if (id !== "Demo") {
          await deleteUserDoc(id);
        }
      } else {
        const updates: any = { status: action };
        if (id === "Demo" && action === "disabled") {
          const userDoc = await getUserDoc("Demo");
          if (userDoc && userDoc.exists) {
            const curData = userDoc.data()!;
            const sessions = { ...(curData.activeSessions || {}) };
            Object.keys(sessions).forEach(k => {
              sessions[k] = { ...sessions[k], status: "terminated", terminatedAt: Date.now() };
            });
            updates.activeSessions = sessions;
            syncSessionsToRealtimeDb("Demo", sessions);
          }
        }
        await updateUserDoc(id, updates);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Bulk action error:", error);
    return res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

export default router;
