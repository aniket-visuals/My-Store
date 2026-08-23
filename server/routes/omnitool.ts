import { Router } from "express";
import { websiteAdminApp } from "../firebaseAdmin.js";
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createCanonicalPayload, signPayload } from "../utils/omnitoolAuth.js";

dotenv.config();
const router = Router();

// Retrieve allowed admin emails from environment
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

// Middleware to verify Website Admin JWT token and email
const verifyAdmin = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const authInstance = getAuth(websiteAdminApp);
    const decodedToken = await authInstance.verifyIdToken(token);
    
    // Check if the user's email is in the allowed admin list
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
    const db = getFirestore(websiteAdminApp);
    const cleanUsername = username.trim();
    const userDocRef = db.collection('omnitool_users').doc(cleanUsername);
    const userSnapshot = await userDocRef.get();
    
    if (!userSnapshot.exists) {
      return res.status(401).json({ error: "account_not_found" });
    }

    const userData = userSnapshot.data()!;
    if (userData.status !== 'active') {
      return res.status(403).json({ error: "account_disabled" });
    }

    let isValid = false;
    
    // Safe migration: check passwordHash if it exists, else verify plain text and migrate
    if (userData.passwordHash) {
      isValid = await bcrypt.compare(password, userData.passwordHash);
    } else if (userData.password && userData.password === password) {
      isValid = true;
      // Automatically migrate to hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      // Wait for update (no need to block response but we'll do it safely)
      await userDocRef.update({
        passwordHash: hash,
        password: null // Clean up legacy plaintext password
      });
    }

    if (!isValid) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // Generate secure cryptographically random session token
    const token = crypto.randomBytes(32).toString('hex');
    const updatedAt = Date.now();
    const sessionData = {
      deviceId,
      token,
      updatedAt
    };

    // Save active session (replaces any previous session, causing concurrent_login on old device)
    await userDocRef.update({ activeSession: sessionData });

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

    // Session is valid
    // Generate new valid RSA Authorization Payload
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
// ADMIN ENDPOINTS (Protected by Website Auth)
// ==========================================

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const db = getFirestore(websiteAdminApp);
    const snapshot = await db.collection('omnitool_users').get();
    
    if (snapshot.empty) {
      return res.json([]);
    }

    // Transform to array and strip sensitive password hashes
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
      username: cleanUsername // keep username inside doc as well
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
      updates.password = null; // Clean up old legacy plaintext password
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

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
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

// Bulk update users
router.post('/users/bulk', verifyAdmin, async (req, res) => {
  const { action, userIds } = req.body;

  if (!action || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: "Invalid request parameters" });
  }

  try {
    const db = getFirestore(websiteAdminApp);
    const batch = db.batch();
    
    userIds.forEach(id => {
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

export default router;
