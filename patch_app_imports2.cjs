const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('const RefundPolicy = lazy')) {
  appCode = appCode.replace(
    'const TermsConditions = lazy(() => import("./components/TermsConditions"));',
    'const TermsConditions = lazy(() => import("./components/TermsConditions"));\nconst RefundPolicy = lazy(() => import("./components/RefundPolicy"));\nconst AboutPage = lazy(() => import("./components/AboutPage"));'
  );
  fs.writeFileSync('src/App.tsx', appCode);
}
