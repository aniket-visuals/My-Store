const fs = require('fs');

// Patch CheckoutPage.tsx for secure checkout notice
let checkoutCode = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');
if (!checkoutCode.includes('Secure Checkout Notice')) {
  checkoutCode = checkoutCode.replace(
    /<div className="border-t border-brand-dark\/10 pt-4 flex justify-between items-center text-sm font-bold text-brand-dark">/g,
    `<div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-emerald-900 m-0">Secure Checkout Notice</p>
                <p className="text-emerald-800 m-0 text-xs mt-1">Your payment information is encrypted and securely processed. We do not store any sensitive financial data on our servers.</p>
              </div>
            </div>
            
            <div className="border-t border-brand-dark/10 pt-4 flex justify-between items-center text-sm font-bold text-brand-dark">`
  );
  fs.writeFileSync('src/components/CheckoutPage.tsx', checkoutCode);
}

// Patch AccountPortal.tsx for authentication notice
let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');
if (!portalCode.includes('By signing in, you agree')) {
  portalCode = portalCode.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*return \(\s*<div className="min-h-screen/g,
    `    <p className="text-xs text-center text-brand-dark/40 mt-6">
                By signing in, you agree to our <a href="/terms" className="underline hover:text-brand-dark">Terms</a> and <a href="/privacy" className="underline hover:text-brand-dark">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen`
  );
  
  if (portalCode.includes('<p className="text-xs text-center text-brand-dark/40 mt-6">')) {
     fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
  } else {
    console.log("Could not find insertion point for portal code");
  }
}

