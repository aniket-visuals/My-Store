const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
let formCode = fs.readFileSync('edit_product_form.tsx', 'utf8');

// Insert formCode before `return (` which is at the end of the file.
code = code.replace(/  return \(\n    <div className="min-h-screen bg-brand-bg font-sans flex">/, formCode + '\n  return (\n    <div className="min-h-screen bg-brand-bg font-sans flex">');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
