const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('import RefundPolicy')) {
  appCode = appCode.replace(
    'import TermsConditions from "./components/TermsConditions";',
    'import TermsConditions from "./components/TermsConditions";\nimport RefundPolicy from "./components/RefundPolicy";\nimport AboutPage from "./components/AboutPage";'
  );
  fs.writeFileSync('src/App.tsx', appCode);
}
