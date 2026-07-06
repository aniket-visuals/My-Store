import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Clock, ArrowLeft, LogOut, Image as ImageIcon, ShieldAlert,
  SearchX
} from "lucide-react";
import { OrderData } from "../services/orderService";

interface Order extends OrderData {
  id: string;
  orderId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  
  // Modals state
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: "Approve" | "Reject", order: Order } | null>(null);
  
  // Toasts
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Simple auth check - could be expanded to check custom claims for admin
  if (!auth.currentUser) {
    return <Navigate to="/portal" replace />;
  }

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      showToast("Failed to fetch orders", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      showToast(`Order successfully ${newStatus.toLowerCase()}`, "success");
    } catch (error) {
      console.error("Error updating order:", error);
      showToast(`Failed to ${newStatus.toLowerCase()} order`, "error");
    }
    setConfirmModal(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border animate-fade-in flex items-center gap-2
          ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
        >
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setScreenshotModal(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setScreenshotModal(null)} className="absolute -top-12 right-0 text-white hover:text-brand-primary p-2">
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
                onClick={() => handleStatusUpdate(confirmModal.order.id, confirmModal.action)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold tracking-wider text-sm transition-colors
                  ${confirmModal.action === "Approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                Yes, {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-brand-dark/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-lg hover:bg-brand-dark/5 text-brand-dark/60 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-xl text-brand-dark">Admin Dashboard</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Manage Orders & Payments</p>
            </div>
          </div>
          
          <button 
            onClick={() => auth.signOut().then(() => navigate("/"))}
            className="flex items-center gap-2 text-sm font-medium text-brand-dark/60 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Email, or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-brand-dark/10 shrink-0 overflow-x-auto">
            {["All", "Pending", "Approved", "Rejected"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? "bg-brand-dark text-white shadow-md" 
                    : "text-brand-dark/60 hover:bg-brand-dark/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
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
                        <div className="text-xs text-brand-dark/60">{order.email}</div>
                        {order.discordOrTelegramUsername && (
                          <div className="text-xs text-brand-primary mt-0.5">@{order.discordOrTelegramUsername}</div>
                        )}
                        <div className="text-xs text-brand-dark/50 mt-0.5">{order.country}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-brand-dark/80 font-medium truncate max-w-[200px]" title={order.productName}>
                          {order.productName}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-dark">
                            {order.currency === 'INR' ? '₹' : '$'}{order.amount}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-brand-dark/5 rounded-md font-mono text-brand-dark/60 border border-brand-dark/10">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {order.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                          {order.status === "Approved" && <CheckCircle className="w-3.5 h-3.5" />}
                          {order.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {order.paymentScreenshotUrl ? (
                            <button 
                              onClick={() => setScreenshotModal(order.paymentScreenshotUrl)}
                              className="p-2 text-brand-dark/60 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors tooltip-trigger"
                              title="View Screenshot"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="w-8"></div>
                          )}
                          
                          <div className="h-6 w-px bg-brand-dark/10 mx-1"></div>
                          
                          <button 
                            onClick={() => setConfirmModal({ action: "Approve", order })}
                            disabled={order.status !== "Pending"}
                            className={`p-2 rounded-lg transition-all flex items-center gap-1
                              ${order.status !== "Pending" 
                                ? "opacity-30 cursor-not-allowed text-brand-dark" 
                                : "text-emerald-600 hover:bg-emerald-50"}`}
                            title="Approve Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => setConfirmModal({ action: "Reject", order })}
                            disabled={order.status !== "Pending"}
                            className={`p-2 rounded-lg transition-all flex items-center gap-1
                              ${order.status !== "Pending" 
                                ? "opacity-30 cursor-not-allowed text-brand-dark" 
                                : "text-red-600 hover:bg-red-50"}`}
                            title="Reject Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-brand-dark/[0.02] border-t border-brand-dark/5 p-4 flex items-center justify-between text-sm text-brand-dark/60">
            <p>Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
