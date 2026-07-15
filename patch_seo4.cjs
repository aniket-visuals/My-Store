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
    
    // Check if it already has the updateMetaTags call in the component
    if (!code.includes('updateMetaTags({')) {
      const newEffect = `\n  React.useEffect(() => {
    updateMetaTags({
      title: "${f.title}",
      description: "${f.description}",
      url: "${f.url}"
    });
  }, []);\n`;

      // Find the first occurrence of `const navigate = useNavigate();` and insert before it
      code = code.replace(
        /const navigate = useNavigate\(\);/,
        `${newEffect}\n  const navigate = useNavigate();`
      );
      
      fs.writeFileSync(f.path, code);
    }
  }
});
