const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  /interface EmailParams \{[\s\S]*?\}/,
  `interface EmailParams {
  to_email: string;
  to_name: string;
  order_id: string;
  product_name: string;
  download_link: string;
  subject?: string;
  body?: string;
}`
);

code = code.replace(
  /email: params\.to_email, \/\/ Mapped to the user's email address\n\s*name: "Editors Hub Store" \/\/ Sender name\n\s*\};/,
  `email: params.to_email, // Mapped to the user's email address
      name: "Editors Hub Store", // Sender name
      subject: params.subject,
      body: params.body
    };`
);

fs.writeFileSync('src/services/emailService.ts', code);
