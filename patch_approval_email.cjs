const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const newSection = `
            {/* Approval Email */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">Approval Email</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Email Subject (Default)</label>
                  <input
                    type="text"
                    value={editingProduct.emailSubject || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, emailSubject: e.target.value})}
                    placeholder="Thanks for purchasing {{product_name}}"
                    className="w-full px-4 py-2 rounded-xl border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Email Body</label>
                  <textarea
                    value={editingProduct.emailBody || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, emailBody: e.target.value})}
                    rows={6}
                    placeholder="Download:\\nhttps://....\\n\\nTutorial:\\nhttps://....\\n\\nDiscord:\\nhttps://...."
                    className="w-full px-4 py-2 rounded-xl border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
                  ></textarea>
                </div>
              </div>
            </section>
`;

code = code.replace(
  /\{\/\* SEO \*\/\}/,
  newSection + '\n            {/* SEO */}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
