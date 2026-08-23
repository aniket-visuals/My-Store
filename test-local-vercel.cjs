// Vercel compiles the TS to CJS and requires it.
const app = require('./api/index.ts');
console.log("Successfully required app!");
