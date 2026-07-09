const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

code = code.replace(
  `              <button 
                onClick={handleOrderSubmit}
                disabled={!isFormValid || isSubmitting || !isAuthenticated} 
                className={\`w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all \${
                  (isFormValid && !isSubmitting)
                    ? "bg-brand-primary hover:bg-brand-accent text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer" 
                    : "bg-brand-primary opacity-50 cursor-not-allowed text-white"
                }\`}
              >`,
  `              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate("/portal")}
                  className="w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all bg-brand-primary hover:bg-brand-accent text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Shield className="w-5 h-5" />
                  Please Login to Place Order
                </button>
              ) : (
              <button 
                onClick={handleOrderSubmit}
                disabled={!isFormValid || isSubmitting} 
                className={\`w-full font-bold font-mono text-sm uppercase tracking-widest py-5 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all \${
                  (isFormValid && !isSubmitting)
                    ? "bg-brand-primary hover:bg-brand-accent text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer" 
                    : "bg-brand-primary opacity-50 cursor-not-allowed text-white"
                }\`}
              >`
);

code = code.replace(
  `                {!isAuthenticated ? "Please Login to Submit" : isSubmitting ? "Processing..." : "Submit Order"}
              </button>`,
  `                {isSubmitting ? "Processing..." : "Submit Order"}
              </button>
              )}`
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
