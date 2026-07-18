const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /<label className="block text-sm font-medium text-brand-dark\/80 mb-1">Status<\/label>.*?<\/select>\s*<\/div>/s,
  `$&
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Total Downloads</label>
                  <input
                    type="number"
                    value={editingProduct.downloadCount || 0}
                    onChange={e => setEditingProduct({...editingProduct, downloadCount: parseInt(e.target.value, 10) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                  />
                </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
