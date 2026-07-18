const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /emailjs\.init\(\{\s*publicKey:\s*publicKey,\s*\}\);\s*const response = await emailjs\.send\(\s*serviceId,\s*templateId,\s*templateParams\s*\);/,
  `const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      {
        publicKey: publicKey,
      }
    );`
);

fs.writeFileSync('src/services/emailService.ts', code);
