const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /email:\s*params\.to_email, \/\/ Mapped to the user's email address/,
  `email: params.to_email,
      to_email: params.to_email,`
);

fs.writeFileSync('src/services/emailService.ts', code);
