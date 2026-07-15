const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

if (!code.includes('Secure Checkout Notice')) {
  code = code.replace(
    /<h3 className="font-display font-bold text-lg text-brand-dark">Order Summary<\/h3>\s*<\/div>\s*<div className="p-6 space-y-6">/,
    `<h3 className="font-display font-bold text-lg text-brand-dark">Order Summary</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-emerald-900 m-0">Secure Checkout Notice</p>
                    <p className="text-emerald-800 m-0 text-xs mt-1 leading-relaxed">Your payment information is encrypted and securely processed. We do not store any sensitive financial data.</p>
                  </div>
                </div>`
  );
  fs.writeFileSync('src/components/CheckoutPage.tsx', code);
}
