import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
      from: `"Editors Hub Store" <support@editorshubstore.in>`,
      to: to_email,
      subject: subject,
      text: body,
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
