const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  /isPopular\?: boolean;/,
  `isPopular?: boolean;\n  faqs?: FaqItem[];\n  fileSize?: string;\n  commercialRights?: boolean;`
);
fs.writeFileSync('src/types.ts', code);
