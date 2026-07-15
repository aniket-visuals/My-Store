const fs = require('fs');

let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');

if (!portalCode.includes('By signing in, you agree')) {
  portalCode = portalCode.replace(
    /<span>Sign in with Google<\/span>\s*<\/button>\s*\{\/\* Sign in switcher footer \*\/\}/,
    `<span>Sign in with Google</span>
                </button>
                
                <p className="text-[10px] text-center text-black/40 mt-4 font-sans font-medium px-4 leading-relaxed">
                  By continuing, you agree to our <a href="/terms" className="underline hover:text-black">Terms of Service</a> and <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
                </p>

                {/* Sign in switcher footer */}`
  );
  
  if (portalCode.includes('By continuing, you agree')) {
    fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
    console.log("Portal successfully patched.");
  } else {
    console.log("Could not match the specific button.");
  }
}
