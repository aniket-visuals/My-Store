const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const modalReplacement = `
      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const activeProductForOrder = products.find(p => p.id === confirmModal.order.productId);
        const defaultSubject = activeProductForOrder?.emailSubject || \`Thanks for purchasing \${activeProductForOrder?.name}\`;
        const defaultBody = activeProductForOrder?.emailBody || \`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-brand-dark/10 max-h-[90vh] overflow-y-auto">
              <h3 className="font-display font-bold text-xl mb-2 text-brand-dark">
                Confirm Action
              </h3>
              <p className="text-brand-dark/70 text-sm mb-6">
                Are you sure you want to <strong className={confirmModal.action === "Approve" ? "text-emerald-600" : "text-red-600"}>{confirmModal.action.toLowerCase()}</strong> order {confirmModal.order.orderId}? This action cannot be easily undone.
              </p>
              
              {confirmModal.action === "Approve" && (
                <div className="mb-6 space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="messageType" 
                        value="default"
                        checked={approvalMessageType === "default"}
                        onChange={() => setApprovalMessageType("default")}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm font-medium text-brand-dark">Use Product Default</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="messageType" 
                        value="custom"
                        checked={approvalMessageType === "custom"}
                        onChange={() => setApprovalMessageType("custom")}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm font-medium text-brand-dark">Use Custom Message</span>
                    </label>
                  </div>
                  
                  {approvalMessageType === "default" && (
                    <div className="space-y-3 bg-brand-dark/[0.02] p-4 rounded-xl border border-brand-dark/5 opacity-80 pointer-events-none">
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Product Subject</label>
                        <input
                          type="text"
                          value={defaultSubject}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-brand-dark/[0.03] outline-none text-sm text-brand-dark"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Product Body</label>
                        <textarea
                          value={defaultBody}
                          readOnly
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 bg-brand-dark/[0.03] outline-none text-sm text-brand-dark resize-y"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {approvalMessageType === "custom" && (
                    <div className="space-y-3 bg-brand-dark/[0.02] p-4 rounded-xl border border-brand-dark/5">
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Custom Subject</label>
                        <input
                          type="text"
                          value={customEmailSubject}
                          onChange={(e) => setCustomEmailSubject(e.target.value)}
                          placeholder="Custom Subject..."
                          className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Custom Body</label>
                        <textarea
                          value={customEmailBody}
                          onChange={(e) => setCustomEmailBody(e.target.value)}
                          rows={4}
                          placeholder="Custom message body..."
                          className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm resize-y"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setConfirmModal(null);
                    setApprovalMessageType("default");
                    setCustomEmailSubject("");
                    setCustomEmailBody("");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusUpdate(confirmModal.order, confirmModal.action === "Approve" ? "Approved" : "Rejected")}
                  className={\`flex-1 px-4 py-2.5 rounded-xl text-white font-bold tracking-wider text-sm transition-colors
                    \${confirmModal.action === "Approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}\`}
                >
                  Yes, {confirmModal.action}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
`;

code = code.replace(
  /\{\/\* Confirmation Modal \*\/\}[\s\S]*?Yes, \{confirmModal\.action\}\n              <\/button>\n            <\/div>\n          <\/div>\n        <\/div>\n      \)\}/,
  modalReplacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
