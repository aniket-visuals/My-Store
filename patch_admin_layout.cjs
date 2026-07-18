const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const replacement = `
  const renderOrders = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Email, or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-brand-dark/10 shrink-0 overflow-x-auto">
            {["All", "Pending", "Approved", "Rejected"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={\`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all \${
                  statusFilter === status 
                    ? "bg-brand-dark text-white shadow-md" 
                    : "text-brand-dark/60 hover:bg-brand-dark/5"
                }\`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-dark/10 text-brand-dark rounded-xl font-medium text-sm hover:bg-brand-dark/5 transition-colors shrink-0 whitespace-nowrap shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-brand-dark/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-brand-dark/[0.02] border-b border-brand-dark/5">
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Order ID</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Payment</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-dark/40 text-sm">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-brand-dark/40">
                    <SearchX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-base font-medium">No orders found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-brand-dark/[0.01] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-brand-dark">{order.orderId}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-brand-dark/80 whitespace-nowrap">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-brand-dark">{order.customerName}</div>
                      <div className="text-xs text-brand-dark/60 truncate max-w-[200px]">{order.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-brand-dark max-w-[200px] truncate">{order.productName}</div>
                      <div className="text-xs text-brand-dark/60 font-mono">$\\{order.amount}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-brand-dark/5 rounded-md text-brand-dark/80 uppercase">
                          {order.paymentMethod}
                        </span>
                        {order.screenshotUrl && (
                          <button 
                            onClick={() => setScreenshotModal(order.screenshotUrl!)}
                            className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                            title="View receipt screenshot"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border \${getStatusColor(order.status)}\`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                         onClick={() => setConfirmModal({ action: "Approve", order })}
                        disabled={order.status === "Approved"}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                         onClick={() => setConfirmModal({ action: "Reject", order })}
                        disabled={order.status === "Rejected"}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-brand-dark/10 shrink-0 overflow-x-auto">
            {["All", "Published", "Draft"].map(status => (
              <button
                key={status}
                onClick={() => setProductStatusFilter(status as any)}
                className={\`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all \${
                  productStatusFilter === status 
                    ? "bg-brand-dark text-white shadow-md" 
                    : "text-brand-dark/60 hover:bg-brand-dark/5"
                }\`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => showToast("Add Product flow is coming soon", "success")}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-medium text-sm hover:bg-brand-accent transition-colors shrink-0 whitespace-nowrap shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-brand-dark/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-brand-dark/[0.02] border-b border-brand-dark/5">
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider w-16">Image</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Product Name</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Price (USD)</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Price (INR)</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Last Updated</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {productsLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-dark/40 text-sm">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-brand-dark/40">
                    <SearchX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-base font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-brand-dark/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-brand-dark/10 bg-brand-dark/5">
                        {product.image ? (
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <ImageIcon className="w-5 h-5 m-2.5 text-brand-dark/40" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-brand-dark">{product.name}</div>
                      <div className="text-xs text-brand-dark/50">{product.category}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-brand-dark/80">$\\{product.price?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-brand-dark/80">₹\\{product.priceInr?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="p-4">
                      <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border \${
                         product.status === "Published" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                      }\`}>
                        {product.status || "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-brand-dark/80 whitespace-nowrap">
                        {product.updatedAt instanceof Date ? product.updatedAt.toLocaleDateString() : formatDate(product.updatedAt)}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => showToast("Edit flow is coming soon", "success")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark/5 text-brand-dark hover:bg-brand-dark/10 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => showToast("Delete flow is coming soon", "error")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex">
      {/* Toast */}
      {toast && (
        <div className={\`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border animate-fade-in flex items-center gap-2
          \${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}\`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setScreenshotModal(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button aria-label="Close screenshot modal" onClick={() => setScreenshotModal(null)} className="absolute -top-12 right-0 text-white hover:text-brand-primary p-2">
              <XCircle className="w-8 h-8" />
            </button>
            <img src={screenshotModal} alt="Payment Screenshot" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-brand-dark/10">
            <h3 className="font-display font-bold text-xl mb-2 text-brand-dark">
              Confirm Action
            </h3>
            <p className="text-brand-dark/70 text-sm mb-6">
              Are you sure you want to <strong className={confirmModal.action === "Approve" ? "text-emerald-600" : "text-red-600"}>{confirmModal.action.toLowerCase()}</strong> order {confirmModal.order.orderId}? This action cannot be easily undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
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
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-dark/5 flex flex-col fixed inset-y-0 z-40">
        <div className="h-16 flex items-center px-6 border-b border-brand-dark/5">
          <button aria-label="Go back" onClick={() => navigate("/")} className="p-2 -ml-2 rounded-lg hover:bg-brand-dark/5 text-brand-dark/60 transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-brand-dark">Admin Panel</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          <button 
            onClick={() => setCurrentPage("orders")}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${
              currentPage === "orders" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }\`}
          >
            <ShoppingCart className="w-5 h-5" />
            Orders
          </button>
          <button 
            onClick={() => setCurrentPage("products")}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors \${
              currentPage === "products" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }\`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
        </div>
        
        <div className="p-4 border-t border-brand-dark/5">
          <button 
             onClick={() => auth.signOut().then(() => navigate("/"))}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-brand-dark/5 sticky top-0 z-30 h-16 flex items-center px-8">
           <h2 className="font-display font-bold text-xl text-brand-dark">
             {currentPage === "orders" ? "Orders" : "Products"}
           </h2>
        </header>
        
        <main className="flex-1 bg-brand-bg">
           {currentPage === "orders" ? renderOrders() : renderProducts()}
        </main>
      </div>
    </div>
  );
}
`;

const regex = /return \(\s*<div className="min-h-screen bg-brand-bg font-sans">[\s\S]*?\n\}/;
code = code.replace(regex, replacement);

// Also fix the export default function line to export default function AdminDashboard
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
