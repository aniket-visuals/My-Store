const fs = require('fs');

const files = [
  {
    path: 'src/components/CheckoutPage.tsx',
    title: 'Checkout — Editors Hub Store',
    description: 'Complete your purchase at Editors Hub Store.',
    url: 'https://www.editorshubstore.in/checkout',
    match: /useEffect\(\(\) => \{\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/
  },
  {
    path: 'src/components/ThankYouPage.tsx',
    title: 'Thank You — Editors Hub Store',
    description: 'Thank you for your purchase at Editors Hub Store.',
    url: 'https://www.editorshubstore.in/thank-you',
    match: /useEffect\(\(\) => \{\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/
  },
  {
    path: 'src/components/AccountPortal.tsx',
    title: 'Account Portal — Editors Hub Store',
    description: 'Manage your Editors Hub Store account, purchases, and settings.',
    url: 'https://www.editorshubstore.in/portal',
    match: /useEffect\(\(\) => \{\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/
  },
  {
    path: 'src/components/AdminDashboard.tsx',
    title: 'Admin Dashboard — Editors Hub Store',
    description: 'Admin dashboard for Editors Hub Store.',
    url: 'https://www.editorshubstore.in/admin',
    match: /useEffect\(\(\) => \{\s+document\.title = "Admin Dashboard";\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/
  }
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let code = fs.readFileSync(f.path, 'utf8');
    if (!code.includes('import { updateMetaTags }')) {
      code = code.replace(
        'import { useNavigate } from "react-router-dom";',
        'import { useNavigate } from "react-router-dom";\nimport { updateMetaTags } from "../utils/seo";'
      );
      
      const newEffect = `useEffect(() => {
    updateMetaTags({
      title: "${f.title}",
      description: "${f.description}",
      url: "${f.url}"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);`;

      if (f.match.test(code)) {
        code = code.replace(f.match, newEffect);
      } else {
        // If not matched, we can prepend the effect in the component (hard to parse robustly here so we just log if it didn't match)
        console.log("Could not patch:", f.path);
      }
      
      fs.writeFileSync(f.path, code);
    }
  }
});
