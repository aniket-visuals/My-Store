const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add lazy import
if (!code.includes('const ContactPage = lazy')) {
  code = code.replace(
    `const TermsConditions = lazy(() => import("./components/TermsConditions"));`,
    `const TermsConditions = lazy(() => import("./components/TermsConditions"));\nconst ContactPage = lazy(() => import("./components/ContactPage"));`
  );
}

// Add route
if (!code.includes('<Route path="/contact"')) {
  code = code.replace(
    `<Route path="/terms" element={<TermsConditions />} />`,
    `<Route path="/terms" element={<TermsConditions />} />\n          <Route path="/contact" element={<ContactPage />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
