const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add lazy import
if (!code.includes('const PrivacyPolicy = lazy')) {
  code = code.replace(
    `const AdminDashboard = lazy(() => import("./components/AdminDashboard"));`,
    `const AdminDashboard = lazy(() => import("./components/AdminDashboard"));\nconst PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));`
  );
}

// Add route
if (!code.includes('<Route path="/privacy"')) {
  code = code.replace(
    `<Route path="/admin" element={<AdminDashboard />} />`,
    `<Route path="/admin" element={<AdminDashboard />} />\n          <Route path="/privacy" element={<PrivacyPolicy />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
