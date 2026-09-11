import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true, 
  auth: {
    user: "support@editorshubstore.in",
    pass: "Aniketraj@godaddy#password123$",
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("Verify error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
