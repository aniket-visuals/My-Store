const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /metaDescription\?: string;\n  createdAt\?: any;\n  updatedAt\?: any;\n\}/,
  `metaDescription?: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: any;
  updatedAt?: any;
}`
);

fs.writeFileSync('src/types.ts', code);
