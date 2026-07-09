const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  `    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS credentials are not configured in environment variables. Simulating email send for now.");
      return true; // Simulate success if no keys are provided
    }`,
  `    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS credentials are not configured in environment variables.");
      return false; // Return false so the UI shows an error toast
    }`
);

fs.writeFileSync('src/services/emailService.ts', code);
