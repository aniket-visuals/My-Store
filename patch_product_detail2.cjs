const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /\{\/\* Perpetual Usage Rights Block \*\/\}.*?\{\/\* Gumroad Frequently Asked Questions Accordion \*\/\}/s,
  `{/* Perpetual Usage Rights Block */}
            {currentProduct.commercialRights && (
              <div className="bg-white border border-brand-dark/5 p-6 sm:p-8 rounded-2xl shadow-xl shadow-brand-dark/[0.02] text-left space-y-4">
                <h3 className="font-display font-semibold text-base text-brand-dark flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Commercial Usage Rights</span>
                </h3>
                
                <div className="space-y-2 text-xs sm:text-sm font-sans font-medium text-brand-dark/80">
                  <div className="flex items-start space-x-3 bg-emerald-500/[0.02] border border-emerald-500/15 p-4 rounded-xl">
                    <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-brand-dark/80 font-medium leading-relaxed">
                      <strong>100% Royalty Free perpetual usage clearance:</strong> Use in monetize platforms including YouTube, Twitch, TikTok, Instagram, commercial advertisements, film displays, and indie broadcasts with no limitations or unexpected copyright claims.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Gumroad Frequently Asked Questions Accordion */}`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
