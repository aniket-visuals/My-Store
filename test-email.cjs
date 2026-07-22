const nodemailer = require("nodemailer");

async function run() {
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 587,
    secure: false, 
    auth: {
      user: "support@editorshubstore.in",
      pass: "Aniketraj@godaddy#password123$",
    },
  });

  try {
    const info = await transporter.sendMail({
      from: "support@editorshubstore.in",
      to: "support@editorshubstore.in",
      subject: "Test",
      text: "Test body",
    });
    console.log("Success:", info.messageId);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
run();
