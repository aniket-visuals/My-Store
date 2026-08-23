import express from "express";
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

// -----------------------------------------------------
// FIREBASE SETUP
// -----------------------------------------------------
let websiteAdminApp;
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
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const verifyAdmin = async (req, res, next) => {
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
// ROUTES
// -----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "Vercel Serverless Function is online (Self-Contained Edition)" });
});

app.get('/api/omnitool/users', verifyAdmin, async (req, res) => {
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
    res.json(usersList);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default app;
