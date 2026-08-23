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

// server/routes/omnitool.ts
var import_express = require("express");

// server/firebaseAdmin.ts
var import_app = require("firebase-admin/app");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var websiteAdminApp;
try {
  if (!(0, import_app.getApps)().find((app2) => app2?.name === "[DEFAULT]")) {
    const serviceAccountJson = process.env.WEBSITE_FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      websiteAdminApp = (0, import_app.initializeApp)({
        credential: (0, import_app.cert)(serviceAccount),
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
      console.log("Website Firebase Admin initialized with full Service Account credentials.");
    } else {
      console.warn("WARNING: WEBSITE_FIREBASE_SERVICE_ACCOUNT is not set. Using default application credentials. Database access might fail.");
      websiteAdminApp = (0, import_app.initializeApp)({
        projectId: process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store"
      });
    }
  } else {
    websiteAdminApp = (0, import_app.getApp)();
  }
} catch (error) {
  console.error("Error initializing default firebase admin:", error);
  websiteAdminApp = (0, import_app.getApp)();
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
function signPayload(payloadString) {
  const privateKey = process.env.OMNITOOL_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("OMNITOOL_PRIVATE_KEY environment variable is missing.");
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
var ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
var verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const authInstance = (0, import_auth.getAuth)(websiteAdminApp);
    const decodedToken = await authInstance.verifyIdToken(token);
    const userEmail = decodedToken.email?.toLowerCase();
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      req.adminEmail = userEmail;
      return next();
    }
    console.warn(`Unauthorized admin access attempt by: ${userEmail}`);
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(401).json({ error: "Unauthorized or expired token" });
  }
};
router.post("/login", async (req, res) => {
  const { username, password, deviceId } = req.body;
  if (!username || !password || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const cleanUsername = username.trim();
    const userDocRef = db.collection("omnitool_users").doc(cleanUsername);
    const userSnapshot = await userDocRef.get();
    if (!userSnapshot.exists) {
      return res.status(401).json({ error: "account_not_found" });
    }
    const userData = userSnapshot.data();
    if (userData.status !== "active") {
      return res.status(403).json({ error: "account_disabled" });
    }
    let isValid = false;
    if (userData.passwordHash) {
      isValid = await import_bcryptjs.default.compare(password, userData.passwordHash);
    } else if (userData.password && userData.password === password) {
      isValid = true;
      const salt = await import_bcryptjs.default.genSalt(10);
      const hash = await import_bcryptjs.default.hash(password, salt);
      await userDocRef.update({
        passwordHash: hash,
        password: null
        // Clean up legacy plaintext password
      });
    }
    if (!isValid) {
      return res.status(401).json({ error: "invalid_credentials" });
    }
    const token = import_crypto2.default.randomBytes(32).toString("hex");
    const updatedAt = Date.now();
    const sessionData = {
      deviceId,
      token,
      updatedAt
    };
    await userDocRef.update({ activeSession: sessionData });
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
router.post("/verify-session", async (req, res) => {
  const { username, token, deviceId } = req.body;
  if (!username || !token || !deviceId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const cleanUsername = username.trim();
    const userSnapshot = await db.collection("omnitool_users").doc(cleanUsername).get();
    if (!userSnapshot.exists) {
      return res.status(401).json({ status: "account_not_found" });
    }
    const userData = userSnapshot.data();
    if (userData.status !== "active") {
      return res.status(403).json({ status: "account_disabled" });
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
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const snapshot = await db.collection("omnitool_users").get();
    if (snapshot.empty) {
      return res.json([]);
    }
    const usersList = snapshot.docs.map((doc) => {
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
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const userRef = db.collection("omnitool_users").doc(cleanUsername);
    const snapshot = await userRef.get();
    if (snapshot.exists) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash(password, salt);
    await userRef.set({
      passwordHash,
      status: status || "active",
      createdAt: Date.now(),
      username: cleanUsername
      // keep username inside doc as well
    });
    return res.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
});
router.put("/users/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, password } = req.body;
  try {
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const userRef = db.collection("omnitool_users").doc(id);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const updates = {};
    if (status) updates.status = status;
    if (password && password.trim() !== "") {
      const salt = await import_bcryptjs.default.genSalt(10);
      updates.passwordHash = await import_bcryptjs.default.hash(password, salt);
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
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    await db.collection("omnitool_users").doc(id).delete();
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
    const db = (0, import_firestore.getFirestore)(websiteAdminApp);
    const batch = db.batch();
    userIds.forEach((id) => {
      const userRef = db.collection("omnitool_users").doc(id);
      if (action === "delete") {
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
var omnitool_default = router;

// api/index.ts
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
app.use("/api/omnitool", omnitool_default);
var index_default = app;
