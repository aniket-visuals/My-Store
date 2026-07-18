const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add file size and commercial rights to Files section
code = code.replace(
  /\{\/\* SEO \*\/\}/s,
  `{/* FAQ */}
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-dark/5">
                <h4 className="font-bold text-brand-dark">FAQs</h4>
                <button
                  type="button"
                  onClick={() => setEditingProduct({
                    ...editingProduct,
                    faqs: [...(editingProduct.faqs || []), { id: Date.now().toString(), question: '', answer: '' }]
                  })}
                  className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add FAQ
                </button>
              </div>
              <div className="space-y-4">
                {(editingProduct.faqs || []).map((faq, index) => (
                  <div key={faq.id || index} className="p-4 border border-brand-dark/10 rounded-xl bg-brand-dark/[0.01] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setEditingProduct({
                        ...editingProduct,
                        faqs: editingProduct.faqs.filter((_, i) => i !== index)
                      })}
                      className="absolute top-2 right-2 text-brand-dark/40 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-medium text-brand-dark/80 mb-1">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={e => {
                          const newFaqs = [...editingProduct.faqs];
                          newFaqs[index].question = e.target.value;
                          setEditingProduct({...editingProduct, faqs: newFaqs});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-dark/80 mb-1">Answer</label>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={e => {
                          const newFaqs = [...editingProduct.faqs];
                          newFaqs[index].answer = e.target.value;
                          setEditingProduct({...editingProduct, faqs: newFaqs});
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                      />
                    </div>
                  </div>
                ))}
                {(!editingProduct.faqs || editingProduct.faqs.length === 0) && (
                  <p className="text-sm text-brand-dark/40 italic">No FAQs added.</p>
                )}
              </div>
            </section>
            
            {/* SEO */}`
);

// Add file size and commercial rights to Files section
code = code.replace(
  /<label className="block text-sm font-medium text-brand-dark\/80 mb-1">Tutorial Link \(Optional\)<\/label>.*?<\/div>/s,
  `$&
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">File Size (e.g., 2.5 GB)</label>
                  <input
                    type="text"
                    value={editingProduct.fileSize || ""}
                    onChange={e => setEditingProduct({...editingProduct, fileSize: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="commercialRights"
                    checked={editingProduct.commercialRights || false}
                    onChange={e => setEditingProduct({...editingProduct, commercialRights: e.target.checked})}
                    className="w-4 h-4 text-brand-primary border-brand-dark/20 rounded focus:ring-brand-primary"
                  />
                  <label htmlFor="commercialRights" className="text-sm font-medium text-brand-dark/80 select-none cursor-pointer">
                    Includes Commercial Usage Rights
                  </label>
                </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
