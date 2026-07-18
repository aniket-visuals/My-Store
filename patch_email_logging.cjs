const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /console\.error\("Failed to send email:", error\);/,
  `console.error("Failed to send email:", error);
    if (error.text) {
      console.error("EmailJS Error details:", error.text);
    }`
);

fs.writeFileSync('src/services/emailService.ts', code);
