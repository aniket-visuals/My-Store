const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /<span className="text-sm font-mono text-brand-dark\/80">\$\{product\.price\}\?\.toFixed\(2\) \|\| "0\.00"\}<\/span>/,
  '<span className="text-sm font-mono text-brand-dark/80">${product.price?.toFixed(2) || "0.00"}</span>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
