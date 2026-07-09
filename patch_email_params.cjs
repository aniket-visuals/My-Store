const fs = require('fs');
let code = fs.readFileSync('src/services/emailService.ts', 'utf8');

code = code.replace(
  `      download_link: params.download_link,
      reply_to: "support@editorshub.store"
    };`,
  `      download_link: params.download_link,
      reply_to: "support@editorshub.store",
      email: params.to_email, // Added to match {{email}} in your template
      name: "Editors Hub Store" // Added to match {{name}} in your template
    };`
);

fs.writeFileSync('src/services/emailService.ts', code);
