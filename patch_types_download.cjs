const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  /updatedAt\?: any;/,
  `updatedAt?: any;\n  downloadCount?: number;`
);
fs.writeFileSync('src/types.ts', code);
