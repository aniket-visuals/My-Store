const fs = require('fs');

let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');
if (!portalCode.includes('By signing in, you agree')) {
  portalCode = portalCode.replace(
    /<\/form>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*return \(/g,
    `</form>
              <p className="text-xs text-center text-brand-dark/40 mt-6">
                By signing in, you agree to our <a href="/terms" className="underline hover:text-brand-dark">Terms</a> and <a href="/privacy" className="underline hover:text-brand-dark">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (`
  );
  if (portalCode.includes('By signing in, you agree')) {
    fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
    console.log("Portal patched");
  } else {
    console.log("Still could not find insertion point.");
  }
}
