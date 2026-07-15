const fs = require('fs');

const files = [
  {
    path: 'src/components/CheckoutPage.tsx',
    title: 'Checkout — Editors Hub Store',
    description: 'Complete your purchase at Editors Hub Store.',
    url: 'https://www.editorshubstore.in/checkout'
  },
  {
    path: 'src/components/ThankYouPage.tsx',
    title: 'Thank You — Editors Hub Store',
    description: 'Thank you for your purchase at Editors Hub Store.',
    url: 'https://www.editorshubstore.in/thank-you'
  },
  {
    path: 'src/components/AccountPortal.tsx',
    title: 'Account Portal — Editors Hub Store',
    description: 'Manage your Editors Hub Store account, purchases, and settings.',
    url: 'https://www.editorshubstore.in/portal'
  },
  {
    path: 'src/components/AdminDashboard.tsx',
    title: 'Admin Dashboard — Editors Hub Store',
    description: 'Admin dashboard for Editors Hub Store.',
    url: 'https://www.editorshubstore.in/admin'
  }
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let code = fs.readFileSync(f.path, 'utf8');
    if (!code.includes('import { updateMetaTags }')) {
      code = code.replace(
        'import React',
        'import React, { useEffect }'
      ).replace(
        'import React, { useEffect }, { useEffect }',
        'import React, { useEffect }' // basic dedupe
      ).replace(
        'import React, { useState, useEffect }',
        'import React, { useState, useEffect }'
      );
      
      if (!code.includes('import { updateMetaTags }')) {
        code = code.replace(
          'from "lucide-react";',
          'from "lucide-react";\nimport { updateMetaTags } from "../utils/seo";'
        );
      }
      
      const newEffect = `\n  useEffect(() => {
    updateMetaTags({
      title: "${f.title}",
      description: "${f.description}",
      url: "${f.url}"
    });
  }, []);\n`;

      // inject after component declaration
      code = code.replace(
        /(export default function [A-Za-z0-9_]+\([^)]*\) {)/,
        `$1${newEffect}`
      );
      
      fs.writeFileSync(f.path, code);
    }
  }
});
