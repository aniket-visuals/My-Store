const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /host: process\.env\.SMTP_HOST \|\| "smtp\.titan\.email",/,
  `host: process.env.SMTP_HOST || "smtpout.secureserver.net",`
);

code = code.replace(
  /user: process\.env\.SMTP_USER,/,
  `user: process.env.SMTP_USER || "support@editorshubstore.in",`
);

code = code.replace(
  /pass: process\.env\.SMTP_PASS,/,
  `pass: process.env.SMTP_PASS || "Aniketraj@godaddy#password123$",`
);

code = code.replace(
  /from: \`"\$\{process\.env\.SMTP_FROM_NAME \|\| 'Editors Hub Store'\}\" <\$\{process\.env\.SMTP_FROM_EMAIL \|\| process\.env\.SMTP_USER\}\>\`,/,
  `from: \`"\$\{process.env.SMTP_FROM_NAME || 'Editors Hub Store'\}\" <\$\{process.env.SMTP_FROM_EMAIL || 'support@editorshubstore.in'\}\>\`,`
);

fs.writeFileSync('server.ts', code);
