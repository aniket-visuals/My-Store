import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import omnitoolRouter from "../server/routes/omnitool.js";
import { generateHtmlEmail } from "../server/emailTemplate.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for external clients (like OmniTool)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-test-auth");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Mount OmniTool API routes on all path variations
app.use("/api/omnitool", omnitoolRouter);
app.use("/omnitool", omnitoolRouter);
app.use("/api", omnitoolRouter);
app.use("/", omnitoolRouter);

// API route for sending email
app.post("/api/send-email", async (req: any, res: any) => {
  const { to_email, subject, body, html } = req.body;

  if (!to_email || !subject || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Mocking Email Send (No SMTP credentials found):", to_email);
      return res.json({ success: true, mocked: true });
    }

    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true, 
      auth: {
        user: "admin@editorshubstore.in",
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = html || generateHtmlEmail({
      subject,
      body,
      storeUrl: "https://editorshubstore.in",
      supportEmail: process.env.SMTP_FROM_EMAIL || "admin@editorshubstore.in",
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Editors Hub Store'}" <${process.env.SMTP_FROM_EMAIL || 'admin@editorshubstore.in'}>`,
      to: to_email,
      subject,
      text: body,
      html: emailHtml,
    });

    console.log("Message sent: %s", info.messageId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/health", (_req: any, res: any) => {
  res.json({ status: "Vercel Serverless Function is online (Ultimate Monolith Edition)" });
});

export default app;
