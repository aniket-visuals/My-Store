const fs = require('fs');

let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');
if (!portalCode.includes('By signing in, you agree')) {
  portalCode = portalCode.replace(
    'className="w-full bg-white text-brand-dark border border-brand-dark/10 py-3 rounded-xl font-bold font-sans hover:bg-brand-dark/5 transition-all flex items-center justify-center gap-3 shadow-sm"',
    'className="w-full bg-white text-brand-dark border border-brand-dark/10 py-3 rounded-xl font-bold font-sans hover:bg-brand-dark/5 transition-all flex items-center justify-center gap-3 shadow-sm"'
  );
  
  // Actually let's just insert it before the closing </div> of the form container
  // We can look for "Continue with Google"
  portalCode = portalCode.replace(
    /Continue with Google\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/g,
    `Continue with Google
                </button>
                <p className="text-xs text-center text-brand-dark/40 mt-6 font-sans">
                  By signing in, you agree to our <a href="/terms" className="underline hover:text-brand-dark">Terms</a> and <a href="/privacy" className="underline hover:text-brand-dark">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>`
  );
  fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
}
