const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
if (!appCode.includes('import RefundPolicy')) {
  appCode = appCode.replace(
    'import TermsConditions from "./components/TermsConditions";',
    'import TermsConditions from "./components/TermsConditions";\nimport RefundPolicy from "./components/RefundPolicy";\nimport AboutPage from "./components/AboutPage";'
  );
}

// Routes
if (!appCode.includes('<Route path="/refund" element={<RefundPolicy />} />')) {
  appCode = appCode.replace(
    '<Route path="/terms" element={<TermsConditions />} />',
    '<Route path="/terms" element={<TermsConditions />} />\n              <Route path="/refund" element={<RefundPolicy />} />\n              <Route path="/about" element={<AboutPage />} />'
  );
}

// Cookie notice component
const cookieNotice = `
// Cookie Notice Component
function CookieNotice() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);
  
  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-black/10 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-brand-dark">
      <div className="text-sm">
        <p className="font-semibold mb-1">We use cookies</p>
        <p className="opacity-70">This website uses cookies to ensure you get the best experience on our website. <a href="/privacy" className="underline">Learn more</a></p>
      </div>
      <button onClick={accept} className="bg-brand-dark text-white px-6 py-2 rounded-lg text-sm font-bold shrink-0 hover:bg-black transition-colors w-full md:w-auto">
        Accept
      </button>
    </div>
  );
}
`;

if (!appCode.includes('function CookieNotice()')) {
  appCode = appCode.replace(
    'export default function App() {',
    cookieNotice + '\nexport default function App() {'
  );
  
  // Add CookieNotice to app root
  appCode = appCode.replace(
    '</Router>',
    '  <CookieNotice />\n    </Router>'
  );
}

fs.writeFileSync('src/App.tsx', appCode);
