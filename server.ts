import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for sending email
  app.post("/api/send-email", async (req, res) => {
    const { to_email, subject, body } = req.body;

    if (!to_email || !subject || !body) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtpout.secureserver.net",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT || "587", 10) === 465,
        auth: {
          user: process.env.SMTP_USER || "support@editorshubstore.in",
          pass: process.env.SMTP_PASS || "Aniketraj@godaddy#password123$",
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Editors Hub Store'}" <${process.env.SMTP_FROM_EMAIL || 'support@editorshubstore.in'}>`,
        to: to_email,
        subject: subject,
        text: body,
      });

      console.log("Message sent: %s", info.messageId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
