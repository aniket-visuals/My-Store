const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add category input
code = code.replace(
  /<select\s+value=\{editingProduct\.category\}\s+onChange=\{e => setEditingProduct\(\{...editingProduct, category: e\.target\.value\}\)\}\s+className="w-full[^>]+>\s*<option value="sound-effects">Sound Effects<\/option>\s*<option value="video-assets">Video Assets<\/option>\s*<option value="presets">Presets<\/option>\s*<option value="templates">Templates<\/option>\s*<\/select>/,
  `<div className="flex gap-2">
                    <select
                      value={["sound-effects", "video-assets", "presets", "templates"].includes(editingProduct.category) ? editingProduct.category : (editingProduct.category ? "custom" : "sound-effects")}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value === 'custom' ? '' : e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    >
                      <option value="sound-effects">Sound Effects</option>
                      <option value="video-assets">Video Assets</option>
                      <option value="presets">Presets</option>
                      <option value="templates">Templates</option>
                      <option value="custom">Add New Category...</option>
                    </select>
                    {!["sound-effects", "video-assets", "presets", "templates", ""].includes(editingProduct.category) || (!["sound-effects", "video-assets", "presets", "templates"].includes(editingProduct.category) && editingProduct.category !== undefined) ? (
                      <input
                        type="text"
                        placeholder="New category..."
                        value={editingProduct.category === 'custom' ? '' : editingProduct.category}
                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                      />
                    ) : null}
                  </div>`
);

// 2. Media section
code = code.replace(
  /\{\/\* Media \*\/\}.*?\{\/\* Files \& Links \*\/\}/s,
  `{/* Media */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">Media</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Thumbnail URL (1st Image)</label>
                  <input
                    type="url"
                    value={editingProduct.thumbnail}
                    onChange={e => setEditingProduct({...editingProduct, thumbnail: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                  {editingProduct.thumbnail && (
                    <img src={editingProduct.thumbnail} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-brand-dark/10" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Preview Video URL / 2nd Image</label>
                  <input
                    type="url"
                    value={editingProduct.previewVideo || ""}
                    onChange={e => setEditingProduct({...editingProduct, previewVideo: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">More Gallery Images (Comma separated URLs)</label>
                  <input
                    type="text"
                    value={(editingProduct.galleryImages || []).join(', ')}
                    onChange={e => setEditingProduct({...editingProduct, galleryImages: e.target.value.split(',').map(url => url.trim()).filter(url => url)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
              </div>
            </section>
            
            {/* Files & Links */}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
