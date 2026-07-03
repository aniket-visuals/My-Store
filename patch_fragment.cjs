const fs = require('fs');
let code = fs.readFileSync('src/components/AccountPortal.tsx', 'utf-8');

code = code.replace(/{activeTab === "signup" && \(\s*<div>/g, '{activeTab === "signup" && (\n                    <>\n                    <div>');
code = code.replace(/<\/div>\s*\}\)\s*<div>\s*<label className="block text-\[10px\] font-mono text-black\/50/g, '</div>\n                    </>\n                  )}\n\n                  <div>\n                    <label className="block text-[10px] font-mono text-black/50');

fs.writeFileSync('src/components/AccountPortal.tsx', code);
