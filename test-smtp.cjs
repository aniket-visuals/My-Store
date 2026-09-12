const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

async function testConnection(host, user, pass) {
  console.log(`\nTesting connection to: ${host} with user: ${user}`);
  const transporter = nodemailer.createTransport({
    host: host,
    port: 465,
    secure: true,
    auth: { user, pass },
    debug: false,
    logger: false
  });

  try {
    await transporter.verify();
    console.log("✅ SUCCESS: Logged in successfully!");
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }
}

async function run() {
  const pass = process.env.SMTP_PASS;
  if (!pass) {
    console.log("No SMTP_PASS found in env.");
    return;
  }
  
  await testConnection("smtp.titan.email", "admin@editorshubstore.in", pass);
  await testConnection("smtp.titan.email", "support@editorshubstore.in", pass);
  await testConnection("smtpout.secureserver.net", "admin@editorshubstore.in", pass);
  await testConnection("smtpout.secureserver.net", "support@editorshubstore.in", pass);
}

run();
