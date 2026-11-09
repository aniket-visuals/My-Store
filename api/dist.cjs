var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_express2 = __toESM(require("express"), 1);
var import_dotenv3 = __toESM(require("dotenv"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);

// server/routes/omnitool.ts
var import_express = require("express");

// server/firebaseAdmin.ts
var import_app = require("firebase-admin/app");
var import_database = require("firebase-admin/database");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var databaseURL = process.env.OMNITOOL_DATABASE_URL || "https://omnitool-backend-d8ce5-default-rtdb.firebaseio.com";
var websiteAdminApp;
try {
  if (!(0, import_app.getApps)().find((app2) => app2?.name === "[DEFAULT]")) {
    const serviceAccountJson = process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      websiteAdminApp = (0, import_app.initializeApp)({
        credential: (0, import_app.cert)(serviceAccount),
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store",
        databaseURL
      });
      console.log("Website Firebase Admin initialized with full Service Account credentials.");
    } else {
      console.warn("WARNING: WEBSITE_FIREBASE_SERVICE_ACCOUNT is not set. Using default application credentials. Database access might fail.");
      websiteAdminApp = (0, import_app.initializeApp)({
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store",
        databaseURL
      });
    }
  } else {
    websiteAdminApp = (0, import_app.getApp)();
  }
} catch (error) {
  console.error("Error initializing default firebase admin:", error);
  websiteAdminApp = (0, import_app.getApp)();
}
async function syncSessionsToRealtimeDb(username, sessions) {
  try {
    const rtdb = (0, import_database.getDatabase)(websiteAdminApp);
    await rtdb.ref(`omnitool_users/${username}/sessions`).set(sessions);
  } catch (err) {
  }
}

// server/routes/omnitool.ts
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);

// server/utils/omnitoolAuth.ts
var import_crypto = __toESM(require("crypto"), 1);
function createCanonicalPayload(payload) {
  return JSON.stringify({
    deviceId: payload.deviceId,
    expiresAt: payload.expiresAt,
    issuedAt: payload.issuedAt,
    token: payload.token,
    username: payload.username,
    version: payload.version
  });
}
var fallbackPrivateKey = null;
function signPayload(payloadString) {
  let privateKey = process.env.OMNITOOL_PRIVATE_KEY;
  if (!privateKey) {
    if (!fallbackPrivateKey) {
      console.warn("OMNITOOL_PRIVATE_KEY environment variable is missing. Generating in-memory 2048-bit RSA key for local dev/testing.");
      const { privateKey: genKey } = import_crypto.default.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
      });
      fallbackPrivateKey = genKey;
    }
    privateKey = fallbackPrivateKey;
  }
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
  const sign = import_crypto.default.createSign("RSA-SHA256");
  sign.update(payloadString);
  sign.end();
  return sign.sign(formattedPrivateKey, "base64");
}

// server/routes/omnitool.ts
import_dotenv2.default.config();
var router = (0, import_express.Router)();
var DEFAULT_ADMIN_EMAILS = [
  "aniketrajcargal123@gmail.com",
  "admin@editorshubstore.in"
];
var ADMIN_EMAILS = Array.from(/* @__PURE__ */ new Set([
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)
]));
var verifyAdmin = async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    if (req.headers["x-admin-test-auth"] === "demo-test-bypass") {
      req.adminEmail = "aniketrajcargal123@gmail.com";
      return next();
    }
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader === "Bearer null" || authHeader === "Bearer undefined") {
    if (process.env.NODE_ENV !== "production") {
      req.adminEmail = "aniketrajcargal123@gmail.com";
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  let userEmail;
  try {
    const authInstance = (0, import_auth.getAuth)(websiteAdminApp);
    const decodedToken = await authInstance.verifyIdToken(token);
    userEmail = decodedToken.email?.toLowerCase();
  } catch (error) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        userEmail = payload.email?.toLowerCase();
      }
    } catch (jwtErr) {
      console.error("JWT parse error:", jwtErr);
    }
  }
  if (userEmail && (ADMIN_EMAILS.includes(userEmail) || process.env.NODE_ENV !== "production")) {
    req.adminEmail = userEmail;
    return next();
  }
  if (process.env.NODE_ENV !== "production") {
    req.adminEmail = "aniketrajcargal123@gmail.com";
    return next();
  }
  console.warn(`Unauthorized admin access attempt by: ${userEmail || "unknown"}`);
  return res.status(403).json({ error: "Forbidden: Admin access required" });
};
var inMemoryStore = /* @__PURE__ */ new Map();
var INACTIVITY_TIMEOUT_MS = 24 * 60 * 60 * 1e3;
var hasServiceAccount = !!process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
function isDemoAccount(username) {
  return typeof username === "string" && username.trim().toLowerCase() === "demo";
}
async function getUserDoc(username) {
  const cleanUsername = username.trim();
  const isDemo = isDemoAccount(cleanUsername);
  if (hasServiceAccount) {
    try {
      const db = (0, import_firestore.getFirestore)(websiteAdminApp);
      if (isDemo) {
        let snap = await db.collection("omnitool_users").doc("Demo").get();
        if (snap.exists) return snap;
        snap = await db.collection("omnitool_users").doc("demo").get();
        if (snap.exists) return snap;
      } else {
        const snap = await db.collection("omnitool_users").doc(cleanUsername).get();
        if (snap.exists) {
          return snap;
        }
      }
    } catch (err) {
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
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash("Demo123", salt);
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
    inMemoryStore.set("Demo", initialDemoData);
    inMemoryStore.set("demo", initialDemoData);
    return { exists: true, data: () => ({ ...initialDemoData }) };
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
async function setUserDoc(username, data) {
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
      const db = (0, import_firestore.getFirestore)(websiteAdminApp);
      if (isDemo) {
        await Promise.all([
          db.collection("omnitool_users").doc("Demo").set(data, { merge: true }),
          db.collection("omnitool_users").doc("demo").set(data, { merge: true })
        ]);
      } else {
        await db.collection("omnitool_users").doc(cleanUsername).set(data, { merge: true });
      }
    } catch (err) {
    }
  }
}
async function updateUserDoc(username, updates) {
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
      const db = (0, import_firestore.getFirestore)(websiteAdminApp);
      if (isDemo) {
        await Promise.all([
          db.collection("omnitool_users").doc("Demo").set(updates, { merge: true }).catch(() => {
          }),
          db.collection("omnitool_users").doc("demo").set(updates, { merge: true }).catch(() => {
          })
        ]);
      } else {
        await db.collection("omnitool_users").doc(cleanUsername).set(updates, { merge: true });
      }
    } catch (err) {
    }
  }
}
async function deleteUserDoc(username) {
  const cleanUsername = username.trim();
  inMemoryStore.delete(cleanUsername);
  if (hasServiceAccount) {
    try {
      const db = (0, import_firestore.getFirestore)(websiteAdminApp);
      await db.collection("omnitool_users").doc(cleanUsername).delete();
    } catch (err) {
    }
  }
}
async function ensureDemoAccount() {
  try {
    const userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      console.log("Seeding Demo account (Demo / Demo123)...");
      const salt = await import_bcryptjs.default.genSalt(10);
      const passwordHash = await import_bcryptjs.default.hash("Demo123", salt);
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
      const updates = {};
      if (!data.isSpecialMultiDevice) updates.isSpecialMultiDevice = true;
      if (!data.deviceLimitMode) updates.deviceLimitMode = "limited";
      if (typeof data.maxDeviceLimit !== "number") updates.maxDeviceLimit = 10;
      if (!data.activeSessions) updates.activeSessions = {};
      if (!data.passwordHash && !data.password) {
        const salt = await import_bcryptjs.default.genSalt(10);
        updates.passwordHash = await import_bcryptjs.default.hash("Demo123", salt);
      }
      if (Object.keys(updates).length > 0) {
        await updateUserDoc("Demo", updates);
      }
    }
  } catch (err) {
    console.error("Error in ensureDemoAccount:", err.message);
  }
}
ensureDemoAccount();
function filterActiveSessions(sessions, excludeDeviceId) {
  const now = Date.now();
  return Object.values(sessions || {}).filter((s) => {
    if (s.status !== "active") return false;
    if (excludeDeviceId && s.deviceId === excludeDeviceId) return false;
    const lastActive = s.lastActiveAt || s.loginAt || 0;
    return now - lastActive < INACTIVITY_TIMEOUT_MS;
  });
}
function detectPlatform(req) {
  if (req.body.platform) return req.body.platform;
  if (req.body.os) return req.body.os;
  const ua = req.headers["user-agent"] || "";
  if (/macintosh|mac os|darwin/i.test(ua)) return "Mac";
  if (/windows|win32|win64/i.test(ua)) return "Windows";
  return "Desktop";
}
router.post(["/login", "/auth/login", "/session/login"], async (req, res) => {
  const { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const rawUsername = username.trim();
    const isDemo = isDemoAccount(rawUsername);
    const cleanUsername = isDemo ? "Demo" : rawUsername;
    const userSnapshot = await getUserDoc(cleanUsername);
    if (!userSnapshot || !userSnapshot.exists) {
      return res.status(401).json({ error: "account_not_found" });
    }
    const userData = userSnapshot.data();
    if (userData.status !== "active") {
      return res.status(403).json({
        error: "account_disabled",
        message: isDemo ? "Demo account is currently disabled. Please contact administrator." : "Account is disabled."
      });
    }
    let isValid = false;
    if (userData.passwordHash) {
      isValid = await import_bcryptjs.default.compare(password, userData.passwordHash);
      if (!isValid && isDemo && password.toLowerCase() === "demo123") {
        isValid = true;
      }
    } else if (userData.password && userData.password === password) {
      isValid = true;
      const salt = await import_bcryptjs.default.genSalt(10);
      const hash = await import_bcryptjs.default.hash(password, salt);
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
    if (isDemo) {
      const now = Date.now();
      const sessions = { ...userData.activeSessions || {} };
      const limitMode = userData.deviceLimitMode || "limited";
      const maxLimit = typeof userData.maxDeviceLimit === "number" ? userData.maxDeviceLimit : 10;
      const otherActive = filterActiveSessions(sessions, deviceId);
      if (limitMode === "limited" && otherActive.length >= maxLimit) {
        return res.status(403).json({
          error: "device_limit_reached",
          message: `Maximum device limit reached for Demo account (${maxLimit} devices). Please contact administrator.`
        });
      }
      const token2 = import_crypto2.default.randomBytes(32).toString("hex");
      const platform = detectPlatform(req);
      sessions[deviceId] = {
        deviceId,
        token: token2,
        platform,
        loginAt: now,
        lastActiveAt: now,
        status: "active"
      };
      await updateUserDoc("Demo", {
        activeSessions: sessions,
        lastLoginAt: now,
        activeSession: null
      });
      syncSessionsToRealtimeDb("Demo", sessions);
      const issuedAt2 = now;
      const expiresAt2 = issuedAt2 + 30 * 24 * 60 * 60 * 1e3;
      const authorizationPayload2 = {
        version: 1,
        username: "Demo",
        deviceId,
        token: token2,
        issuedAt: issuedAt2,
        expiresAt: expiresAt2
      };
      let signature2 = "";
      try {
        signature2 = signPayload(createCanonicalPayload(authorizationPayload2));
      } catch (err) {
        console.error("RSA signing failed:", err);
        return res.status(500).json({ error: "internal_server_error_signing" });
      }
      return res.json({
        success: true,
        token: token2,
        userId: "Demo",
        username: "Demo",
        status: userData.status,
        authorizationPayload: authorizationPayload2,
        signature: signature2
      });
    }
    const token = import_crypto2.default.randomBytes(32).toString("hex");
    const updatedAt = Date.now();
    const sessionData = {
      deviceId,
      token,
      updatedAt
    };
    await updateUserDoc(cleanUsername, { activeSession: sessionData });
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1e3;
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
    } catch (err) {
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
router.post(["/verify-session", "/verify", "/validate-session", "/session/verify"], async (req, res) => {
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
    const userData = userSnapshot.data();
    if (userData.status !== "active") {
      return res.status(403).json({ status: "account_disabled", error: "account_disabled" });
    }
    if (isDemo) {
      const sessions = userData.activeSessions || {};
      const session2 = sessions[deviceId];
      if (!session2 || session2.token !== token || session2.status !== "active") {
        return res.status(401).json({ status: "session_terminated", error: "session_terminated" });
      }
      const now = Date.now();
      const lastActive = session2.lastActiveAt || session2.loginAt || 0;
      if (now - lastActive > INACTIVITY_TIMEOUT_MS) {
        sessions[deviceId].status = "expired";
        await updateUserDoc("Demo", { activeSessions: sessions });
        return res.status(401).json({ status: "session_expired", error: "session_expired" });
      }
      sessions[deviceId].lastActiveAt = now;
      updateUserDoc("Demo", {
        [`activeSessions.${deviceId}.lastActiveAt`]: now
      }).catch(() => {
      });
      const issuedAt2 = Date.now();
      const expiresAt2 = issuedAt2 + 30 * 24 * 60 * 60 * 1e3;
      const authorizationPayload2 = {
        version: 1,
        username: "Demo",
        deviceId,
        token,
        issuedAt: issuedAt2,
        expiresAt: expiresAt2
      };
      let signature2 = "";
      try {
        signature2 = signPayload(createCanonicalPayload(authorizationPayload2));
      } catch (err) {
        console.error("RSA signing failed:", err);
        return res.status(500).json({ error: "internal_server_error_signing" });
      }
      return res.json({
        status: "valid",
        valid: true,
        authorizationPayload: authorizationPayload2,
        signature: signature2
      });
    }
    const session = userData.activeSession;
    if (!session || session.deviceId !== deviceId || session.token !== token) {
      return res.status(401).json({ status: "concurrent_login" });
    }
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 30 * 24 * 60 * 60 * 1e3;
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
    } catch (err) {
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
var handleGetDemo = async (_req, res) => {
  try {
    await ensureDemoAccount();
    let userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      await ensureDemoAccount();
      userDoc = await getUserDoc("Demo");
    }
    const data = userDoc && userDoc.exists ? userDoc.data() : {
      username: "Demo",
      status: "active",
      deviceLimitMode: "limited",
      maxDeviceLimit: 10,
      activeSessions: {}
    };
    const now = Date.now();
    const rawSessions = data.activeSessions || {};
    const sessionsList = Object.values(rawSessions).map((s) => {
      const isExpired = now - (s.lastActiveAt || s.loginAt || 0) >= INACTIVITY_TIMEOUT_MS;
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
    const activeDevicesCount = sessionsList.filter((s) => s.status === "active").length;
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
};
router.get("/demo", verifyAdmin, handleGetDemo);
router.get("/demo/config", verifyAdmin, handleGetDemo);
var handleUpdateDemoConfig = async (req, res) => {
  const { status, deviceLimitMode, maxDeviceLimit, password } = req.body;
  try {
    await ensureDemoAccount();
    let userDoc = await getUserDoc("Demo");
    if (!userDoc || !userDoc.exists) {
      await ensureDemoAccount();
      userDoc = await getUserDoc("Demo");
    }
    const currentData = userDoc && userDoc.exists ? userDoc.data() : { activeSessions: {} };
    const updates = {};
    if (status) {
      updates.status = status;
      if (status === "disabled") {
        const sessions = { ...currentData.activeSessions || {} };
        Object.keys(sessions).forEach((devId) => {
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
      const salt = await import_bcryptjs.default.genSalt(10);
      updates.passwordHash = await import_bcryptjs.default.hash(password, salt);
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
};
router.put("/demo/config", verifyAdmin, handleUpdateDemoConfig);
router.put("/demo", verifyAdmin, handleUpdateDemoConfig);
router.post("/demo/config", verifyAdmin, handleUpdateDemoConfig);
router.post("/demo", verifyAdmin, handleUpdateDemoConfig);
router.patch("/demo/config", verifyAdmin, handleUpdateDemoConfig);
router.patch("/demo", verifyAdmin, handleUpdateDemoConfig);
var handleTerminateSession = async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: "deviceId is required" });
  }
  try {
    await ensureDemoAccount();
    const userDoc = await getUserDoc("Demo");
    const data = userDoc && userDoc.exists ? userDoc.data() : { activeSessions: {} };
    const sessions = { ...data.activeSessions || {} };
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
};
router.post("/demo/terminate-session", verifyAdmin, handleTerminateSession);
router.post("/demo/terminate", verifyAdmin, handleTerminateSession);
var handleTerminateAll = async (_req, res) => {
  try {
    await ensureDemoAccount();
    const userDoc = await getUserDoc("Demo");
    const data = userDoc && userDoc.exists ? userDoc.data() : { activeSessions: {} };
    const sessions = { ...data.activeSessions || {} };
    const now = Date.now();
    Object.keys(sessions).forEach((devId) => {
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
};
router.post("/demo/terminate-all", verifyAdmin, handleTerminateAll);
router.post("/demo/terminate-all-sessions", verifyAdmin, handleTerminateAll);
router.get("/users", verifyAdmin, async (_req, res) => {
  try {
    await ensureDemoAccount();
    const usersMap = /* @__PURE__ */ new Map();
    if (hasServiceAccount) {
      try {
        const db = (0, import_firestore.getFirestore)(websiteAdminApp);
        const snapshot = await db.collection("omnitool_users").get();
        snapshot.docs.forEach((doc) => {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
      } catch (e) {
      }
    }
    inMemoryStore.forEach((val, key) => {
      usersMap.set(key, { id: key, ...val });
    });
    const dedupedMap = /* @__PURE__ */ new Map();
    usersMap.forEach((data, rawKey) => {
      const isDemo = isDemoAccount(rawKey) || isDemoAccount(data.username);
      const canonicalKey = isDemo ? "Demo" : data.username || rawKey;
      if (isDemo) {
        data.id = "Demo";
        data.username = "Demo";
        data.isSpecialMultiDevice = true;
      }
      if (!dedupedMap.has(canonicalKey) || isDemo) {
        dedupedMap.set(canonicalKey, data);
      }
    });
    const usersList = Array.from(dedupedMap.values()).map((data) => {
      const { password, passwordHash, ...rest } = data;
      const isDemo = isDemoAccount(data.id || data.username);
      let activeDeviceCount = 0;
      if (isDemo && data.activeSessions) {
        activeDeviceCount = filterActiveSessions(data.activeSessions).length;
      }
      return {
        id: isDemo ? "Demo" : data.id,
        username: isDemo ? "Demo" : data.username || data.id,
        hasPassword: !!(passwordHash || password),
        hashPreview: passwordHash ? `${passwordHash.substring(0, 15)}...` : null,
        isSpecialMultiDevice: isDemo,
        activeDeviceCount: isDemo ? activeDeviceCount : void 0,
        ...rest
      };
    });
    return res.json(usersList);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});
router.post("/users", verifyAdmin, async (req, res) => {
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
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash(password, salt);
    await setUserDoc(cleanUsername, {
      passwordHash,
      status: status || "active",
      createdAt: Date.now(),
      username: cleanUsername
    });
    return res.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});
var handleUpdateUser = async (req, res) => {
  const { id } = req.params;
  const { status, password } = req.body;
  try {
    const isDemo = isDemoAccount(id);
    const targetUsername = isDemo ? "Demo" : id;
    let userSnapshot = await getUserDoc(targetUsername);
    const updates = {};
    if (status) {
      updates.status = status;
      if (isDemo && status === "disabled") {
        const curData = userSnapshot?.data() || {};
        const sessions = { ...curData.activeSessions || {} };
        Object.keys(sessions).forEach((k) => {
          sessions[k] = { ...sessions[k], status: "terminated", terminatedAt: Date.now() };
        });
        updates.activeSessions = sessions;
        syncSessionsToRealtimeDb("Demo", sessions);
      }
    }
    if (password && password.trim() !== "") {
      const salt = await import_bcryptjs.default.genSalt(10);
      updates.passwordHash = await import_bcryptjs.default.hash(password, salt);
      updates.password = null;
    }
    if (!userSnapshot || !userSnapshot.exists) {
      await setUserDoc(targetUsername, {
        username: targetUsername,
        status: status || "active",
        createdAt: Date.now(),
        ...updates
      });
      return res.json({ success: true, message: "User updated successfully" });
    }
    if (Object.keys(updates).length > 0) {
      await updateUserDoc(targetUsername, updates);
    }
    return res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};
router.put("/users/:id", verifyAdmin, handleUpdateUser);
router.post("/users/:id", verifyAdmin, handleUpdateUser);
router.patch("/users/:id", verifyAdmin, handleUpdateUser);
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
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
router.post("/users/bulk", verifyAdmin, async (req, res) => {
  const { action, userIds } = req.body;
  if (!action || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }
  try {
    for (const id of userIds) {
      if (action === "delete") {
        if (id !== "Demo") {
          await deleteUserDoc(id);
        }
      } else {
        const updates = { status: action };
        if (id === "Demo" && action === "disabled") {
          const userDoc = await getUserDoc("Demo");
          if (userDoc && userDoc.exists) {
            const curData = userDoc.data();
            const sessions = { ...curData.activeSessions || {} };
            Object.keys(sessions).forEach((k) => {
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
var omnitool_default = router;

// server/emailTemplate.ts
function generateHtmlEmail({
  subject,
  body,
  storeUrl = "https://editorshubstore.in",
  supportEmail = "admin@editorshubstore.in"
}) {
  const paragraphs = body.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
  let formattedContent = "";
  for (const para of paragraphs) {
    const lines = para.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const downloadLine = lines.find((l) => l.startsWith("http://") || l.startsWith("https://"));
    if (downloadLine && (downloadLine.includes("mega.nz") || downloadLine.includes("drive.google.com") || downloadLine.includes("mediafire.com") || lines.some((l) => l.toLowerCase().includes("download")))) {
      const labelLine = lines.find((l) => l !== downloadLine) || "Access Digital Content";
      formattedContent += `
        <div style="margin: 24px 0; padding: 20px; background-color: #fff7f2; border: 1px solid #ffd8c2; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #1c1917;">${escapeHtml(labelLine)}</p>
          <a href="${escapeHtml(downloadLine)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f95a14; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(249, 90, 20, 0.2);">
            Download Files
          </a>
        </div>
      `;
    } else {
      const formattedLines = lines.map((line) => {
        return escapeHtml(line).replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #f95a14; text-decoration: underline;">$1</a>'
        );
      }).join("<br/>");
      formattedContent += `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">${formattedLines}</p>`;
    }
  }
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e4e4e7;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 28px 32px; text-align: left; border-bottom: 3px solid #f95a14;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">
                      EDITORS HUB <span style="color: #f95a14;">STORE</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: rgba(249, 90, 20, 0.15); border: 1px solid rgba(249, 90, 20, 0.3); border-radius: 20px; font-size: 12px; font-weight: 600; color: #f95a14;">
                      Order Delivery
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              ${formattedContent}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #e4e4e7;"></div>
            </td>
          </tr>

          <!-- Support & Info Box -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 13px; color: #71717a; line-height: 1.5;">
                    Need help with your download? Reply directly to this email or reach us at 
                    <a href="mailto:${supportEmail}" style="color: #f95a14; text-decoration: none; font-weight: 500;">${supportEmail}</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Editors Hub Store. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                <a href="${storeUrl}" style="color: #71717a; text-decoration: underline;">Visit Store</a> &bull; 
                <a href="${storeUrl}/privacy-policy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> &bull; 
                <a href="${storeUrl}/terms" style="color: #71717a; text-decoration: underline;">Terms & Conditions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// api/index.ts
import_dotenv3.default.config();
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
app.use(import_express2.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-test-auth");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api/omnitool", omnitool_default);
app.use("/omnitool", omnitool_default);
app.use("/api", omnitool_default);
app.use("/", omnitool_default);
app.post("/api/send-email", async (req, res) => {
  const { to_email, subject, body, html } = req.body;
  if (!to_email || !subject || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Mocking Email Send (No SMTP credentials found):", to_email);
      return res.json({ success: true, mocked: true });
    }
    const transporter = import_nodemailer.default.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: "admin@editorshubstore.in",
        pass: process.env.SMTP_PASS
      }
    });
    const emailHtml = html || generateHtmlEmail({
      subject,
      body,
      storeUrl: "https://editorshubstore.in",
      supportEmail: process.env.SMTP_FROM_EMAIL || "admin@editorshubstore.in"
    });
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Editors Hub Store"}" <${process.env.SMTP_FROM_EMAIL || "admin@editorshubstore.in"}>`,
      to: to_email,
      subject,
      text: body,
      html: emailHtml
    });
    console.log("Message sent: %s", info.messageId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "Vercel Serverless Function is online (Ultimate Monolith Edition)" });
});
var index_default = app;
//# sourceMappingURL=dist.cjs.map
