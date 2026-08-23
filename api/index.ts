import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import omnitoolRouter from "../server/routes/omnitool.js";

dotenv.config();

const app = express();
app.use(express.json());

// Mount OmniTool API routes
app.use("/api/omnitool", omnitoolRouter);

// API route for sending email (Ported from server.ts)
app.post("/api/send-email", async (req, res) => {
  const { to_email, subject, body } = req.body;

  if (!to_email || !subject || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false, 
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

// Export the app for Vercel's serverless runtime
export default app;
