const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /const serviceId = 'default_service';\s*const templateId = 'template_gmucd5s';\s*const publicKey = 'LyR7uPNP80yEgPXCC';/,
  `const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_gmucd5s';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'LyR7uPNP80yEgPXCC';`
);

fs.writeFileSync('src/services/emailService.ts', code);
