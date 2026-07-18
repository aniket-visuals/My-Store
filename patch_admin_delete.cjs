const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const \[confirmModal, setConfirmModal\] = useState<\{ action: "Approve" \| "Reject", order: Order \} \| null>\(null\);/,
  `const [confirmModal, setConfirmModal] = useState<{ action: "Approve" | "Reject", order: Order } | null>(null);
  const [deleteProductModal, setDeleteProductModal] = useState<AdminProduct | null>(null);`
);

const deleteFunc = `
  const handleDeleteProduct = async (product: AdminProduct) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "products", product.id));
      showToast("Product deleted successfully", "success");
      setDeleteProductModal(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product", "error");
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(
  /  const handleSaveProduct = async \(e: React.FormEvent\) => \{/,
  deleteFunc + '\n  const handleSaveProduct = async (e: React.FormEvent) => {'
);

const oldButton = `onClick={() => showToast("Delete flow is coming soon", "error")}`;
const newButton = `onClick={() => setDeleteProductModal(product)}`;

code = code.replace(oldButton, newButton);

const modalJSX = `
      {/* Delete Product Modal */}
      {deleteProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-brand-dark/10">
            <h3 className="font-display font-bold text-xl mb-2 text-brand-dark">
              Delete Product
            </h3>
            <p className="text-brand-dark/70 text-sm mb-6">
              Are you sure you want to delete <strong className="text-brand-dark">{deleteProductModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteProductModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteProduct(deleteProductModal)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold tracking-wider text-sm transition-colors bg-red-500 hover:bg-red-600 flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /\{\/\* Sidebar \*\/\}/,
  modalJSX + '\n      {/* Sidebar */}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
