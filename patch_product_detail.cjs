const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

// Replace getActiveFaqs
code = code.replace(
  /const getActiveFaqs = \(\) => COMMON_FAQS;/,
  `const getActiveFaqs = () => (currentProduct.faqs && currentProduct.faqs.length > 0) ? currentProduct.faqs.map(f => ({q: f.question, a: f.answer})) : COMMON_FAQS;`
);

// Add Commercial Rights badge next to DownloadCount badge
code = code.replace(
  /<span className="font-semibold text-brand-primary">\{currentProduct\.downloadCount \?\? 0\}\+ Clean Downloads<\/span>\s*<\/div>/,
  `$&
                {currentProduct.commercialRights && (
                  <div className="flex items-center space-x-1.5 font-mono text-xs text-emerald-700 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">Commercial Rights</span>
                  </div>
                )}`
);

// We need to make sure ShieldCheck is imported if not already. Wait, let's just use Check circle or ShieldCheck. ShieldCheck is likely imported. If not, I can import it.
// Let's check imports.
