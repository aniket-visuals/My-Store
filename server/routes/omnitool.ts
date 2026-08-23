import { Router } from "express";
import { websiteAdminApp, omnitoolAdminApp } from "../firebaseAdmin.js";
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Middleware to verify website admin
const verifyAdmin = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth(websiteAdminApp).verifyIdToken(token);
    
    // Check if master admin
    const masterEmails = ['aniketrajcargal123@gmail.com'];
    if (process.env.ADMIN_EMAILS) {
      masterEmails.push(...process.env.ADMIN_EMAILS.split(',').map(e => e.trim()));
    }

    if (masterEmails.includes(decodedToken.email || '')) {
      req.user = decodedToken;
      return next();
    }

    // Since we don't have website service account credentials to read the "admins" collection,
    // we strictly rely on the master admin email list for API protection. 
    // This perfectly matches the frontend's fallback condition.
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
    if (!omnitoolAdminApp) {
      return res.status(500).json({ error: "Server misconfiguration: OmniTool Admin not initialized" });
    }

    const db = getDatabase(omnitoolAdminApp);
    const cleanUsername = username.trim();
    const userSnapshot = await db.ref(`users/${cleanUsername}`).once('value');
    
    if (!userSnapshot.exists()) {
      return res.status(401).json({ error: "account_not_found" });
    }

    const userData = userSnapshot.val();

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
      await db.ref(`users/${cleanUsername}`).update({
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
    await db.ref(`users/${cleanUsername}/activeSession`).set(sessionData);

    return res.json({
      success: true,
      token,
      username: cleanUsername,
      status: userData.status
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
    if (!omnitoolAdminApp) {
      return res.status(500).json({ error: "Server misconfiguration: OmniTool Admin not initialized" });
    }

    const db = getDatabase(omnitoolAdminApp);
    const cleanUsername = username.trim();
    const userSnapshot = await db.ref(`users/${cleanUsername}`).once('value');
    
    if (!userSnapshot.exists()) {
      return res.status(401).json({ status: "account_not_found" });
    }

    const userData = userSnapshot.val();

    if (userData.status !== 'active') {
      return res.status(403).json({ status: "account_disabled" });
    }

    const session = userData.activeSession;
    if (!session || session.deviceId !== deviceId || session.token !== token) {
      return res.status(401).json({ status: "concurrent_login" });
    }

    // Session is valid
    return res.json({ status: "valid", valid: true });

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
    if (!omnitoolAdminApp) {
      return res.status(500).json({ error: "OmniTool Admin not initialized" });
    }
    const db = getDatabase(omnitoolAdminApp);
    const snapshot = await db.ref('users').once('value');
    const data = snapshot.val();
    
    if (!data) {
      return res.json([]);
    }

    // Transform map to array and strip sensitive password hashes
    const usersList = Object.keys(data).map(key => {
      const { password, passwordHash, ...rest } = data[key];
      return {
        id: key,
        username: key,
        hasPassword: !!(passwordHash || password),
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
    if (!omnitoolAdminApp) throw new Error("Not initialized");
    const db = getDatabase(omnitoolAdminApp);
    const userRef = db.ref(`users/${cleanUsername}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await userRef.set({
      passwordHash,
      status: status || 'active',
      createdAt: Date.now()
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
    if (!omnitoolAdminApp) throw new Error("Not initialized");
    const db = getDatabase(omnitoolAdminApp);
    const userRef = db.ref(`users/${id}`);
    const snapshot = await userRef.once('value');
    
    if (!snapshot.exists()) {
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
    if (!omnitoolAdminApp) throw new Error("Not initialized");
    const db = getDatabase(omnitoolAdminApp);
    await db.ref(`users/${id}`).remove();
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
    if (!omnitoolAdminApp) throw new Error("Not initialized");
    const db = getDatabase(omnitoolAdminApp);
    const updates: any = {};
    
    userIds.forEach(id => {
      if (action === 'delete') {
        updates[`users/${id}`] = null;
      } else {
        updates[`users/${id}/status`] = action;
      }
    });

    await db.ref().update(updates);
    return res.json({ success: true });
  } catch (error) {
    console.error("Bulk action error:", error);
    return res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

export default router;
