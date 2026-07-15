const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add lazy import
if (!code.includes('const TermsConditions = lazy')) {
  code = code.replace(
    `const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));`,
    `const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));\nconst TermsConditions = lazy(() => import("./components/TermsConditions"));`
  );
}

// Add route
if (!code.includes('<Route path="/terms"')) {
  code = code.replace(
    `<Route path="/privacy" element={<PrivacyPolicy />} />`,
    `<Route path="/privacy" element={<PrivacyPolicy />} />\n          <Route path="/terms" element={<TermsConditions />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
