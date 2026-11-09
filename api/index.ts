import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import omnitoolRouter from "../server/routes/omnitool.js";
import { generateHtmlEmail } from "../server/emailTemplate.js";
import { getProductSeoBySlug, injectProductMetaIntoHtml, buildFallbackProductHtml } from "../server/productSeo.js";

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

// Dynamic OpenGraph & Twitter Card HTML handler for /products/:slug on Vercel
async function handleProductSeoPage(req: any, res: any) {
  const slug = req.params.slug || req.query.slug || "";
  const candidatePaths = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html")
  ];

  let baseHtml = "";
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      baseHtml = fs.readFileSync(p, "utf-8");
      break;
    }
  }

  // Fallback to fetching the deployed index.html if serverless bundle doesn't include static files
  if (!baseHtml) {
    try {
      const proto = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "www.editorshubstore.in";
      const resp = await fetch(`${proto}://${host}/index.html`);
      if (resp.ok) {
        baseHtml = await resp.text();
      }
    } catch {
      // Ignore fetch fallback errors
    }
  }

  try {
    const meta = await getProductSeoBySlug(String(slug));
    if (baseHtml) {
      const finalHtml = meta ? injectProductMetaIntoHtml(baseHtml, meta) : baseHtml;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).send(finalHtml);
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(buildFallbackProductHtml(meta));
  } catch (err) {
    if (baseHtml) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(baseHtml);
    }
    return res.status(200).send(buildFallbackProductHtml(null));
  }
}

app.get("/products/:slug", handleProductSeoPage);
app.get("/api/product-seo/:slug", handleProductSeoPage);
app.get("/api/product-seo", handleProductSeoPage);

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
