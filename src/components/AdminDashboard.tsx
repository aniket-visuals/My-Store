import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  Search, Filter, CheckCircle, XCircle, Eye, 
  Clock, ArrowLeft, LogOut, Image as ImageIcon, ShieldAlert,
  SearchX, Download, ShoppingCart, Package, Plus, Edit, Trash2, Save, Users
} from "lucide-react";
import { updateMetaTags } from "../utils/seo";
import { OrderData } from "../services/orderService";
import { sendApprovalEmail } from "../services/emailService";
import { AdminProduct, StoreCategory } from "../types";
import OmniToolUsers from "./OmniToolUsers";

interface Order extends OrderData {
  id: string;
  orderId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any;
}

export default function AdminDashboard() {
  useEffect(() => {
    updateMetaTags({
      title: "Admin Dashboard — Editors Hub Store",
      description: "Admin dashboard for Editors Hub Store.",
      url: "https://www.editorshubstore.in/admin"
    });
  }, []);

  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [currentPage, setCurrentPage] = useState<"orders" | "products" | "categories" | "edit-product" | "omnitool-users">("orders");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"All" | "Published" | "Draft">("All");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  
  // Category State
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<StoreCategory | null>(null);
  const [deleteCategoryAction, setDeleteCategoryAction] = useState<"move" | "delete" | "">("");
  const [replacementCategoryId, setReplacementCategoryId] = useState("");
  
  // Modals state
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: "Approve" | "Reject", order: Order } | null>(null);
  const [deleteProductModal, setDeleteProductModal] = useState<AdminProduct | null>(null);
  const [approvalMessageType, setApprovalMessageType] = useState<"default" | "custom">("default");
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailBody, setCustomEmailBody] = useState("");
  
  // Toasts
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        // Check admins collection
        getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
          setIsAdmin(adminDoc.exists() || user.email === 'aniketrajcargal123@gmail.com');
          setAuthLoading(false);
        }).catch(() => {
          setIsAdmin(user.email === 'aniketrajcargal123@gmail.com');
          setAuthLoading(false);
        });
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts([]);
        setProductsLoading(false);
      } else {
        const productsData: AdminProduct[] = [];
        snapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as AdminProduct);
        });
        setProducts(productsData);
        setProductsLoading(false);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
      setProducts([]);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("displayOrder", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setCategories([]);
        setCategoriesLoading(false);
      } else {
        const categoriesData: StoreCategory[] = [];
        snapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() } as StoreCategory);
        });
        setCategories(categoriesData);
        setCategoriesLoading(false);
      }
    }, (error) => {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setCategoriesLoading(false);
    });
    return () => unsubscribe();
  }, []);



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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

    const handleStatusUpdate = async (order: Order, newStatus: "Approved" | "Rejected") => {
    const currentMsgType = approvalMessageType;
    const customSub = customEmailSubject;
    const customBod = customEmailBody;

    setConfirmModal(null);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      showToast(`Order successfully ${newStatus.toLowerCase()}`, "success");
      
      if (newStatus === "Approved") {
        showToast("Sending approval email...", "success");
        
        const activeProductForOrder = products.find(p => p.id === order.productId);
        
        const replaceVariables = (text: string) => {
          if (!text) return "";
          return text
            .replace(/\{\{customer_name\}\}/g, order.customerName || "")
            .replace(/\{\{customer_email\}\}/g, order.email || "")
            .replace(/\{\{product_name\}\}/g, activeProductForOrder?.name || order.productName || "")
            .replace(/\{\{order_id\}\}/g, order.orderId || "")
            .replace(/\{\{payment_method\}\}/g, order.paymentMethod || "")
            .replace(/\{\{price\}\}/g, order.amount?.toString() || "");
        };

        let rawSubject = "";
        let rawBody = "";

        if (currentMsgType === "custom") {
          rawSubject = customSub;
          rawBody = customBod;
        } else {
          rawSubject = activeProductForOrder?.emailSubject || `Thanks for purchasing ${activeProductForOrder?.name || order.productName}`;
          const productBody = activeProductForOrder?.emailBody || `Download:\n${activeProductForOrder?.downloadLink || "No link"}${activeProductForOrder?.tutorialLink ? `\n\nTutorial:\n${activeProductForOrder.tutorialLink}` : ""}`;
          rawBody = `Hi {{customer_name}},\n\n${productBody}\n\nThank you,\nEditors Hub Store`;
        }
        
        const parsedSubject = replaceVariables(rawSubject);
        const parsedBody = replaceVariables(rawBody);

        const emailResult = await sendApprovalEmail({
          to_email: order.email,
          to_name: order.customerName,
          order_id: order.orderId,
          product_name: order.productName,
          download_link: activeProductForOrder?.downloadLink || "No link provided",
          subject: parsedSubject,
          body: parsedBody
        });
        if (emailResult.success) {
          showToast(`Approval email sent to ${order.email}`, "success");
        } else {
          showToast(`EmailJS Error: ${emailResult.error || 'Unknown error'}`, "error");
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
      showToast(`Failed to ${newStatus.toLowerCase()} order`, "error");
    }
  };

  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      showToast("No orders to export", "error");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Email", "Country", "Social Username", "Product", "Payment Method", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.orderId || "",
        `"${(order.customerName || "").replace(/"/g, '""')}"`,
        order.email || "",
        order.country || "",
        `"${(order.discordOrTelegramUsername || "").replace(/"/g, '""')}"`,
        `"${(order.productName || "").replace(/"/g, '""')}"`,
        order.paymentMethod || "",
        order.amount || 0,
        order.status || "",
        order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(product => {
    const searchLower = productSearchTerm.toLowerCase();
    const matchesSearch = 
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.id || "").toLowerCase().includes(searchLower);
      
    const matchesFilter = productStatusFilter === "All" || product.status === productStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.orderId || "").toLowerCase().includes(searchLower) ||
      (order.email || "").toLowerCase().includes(searchLower) ||
      (order.customerName || "").toLowerCase().includes(searchLower);
    
    let s = (order.status || "").toLowerCase();
    if (s === "approve") s = "approved";
    if (s === "reject") s = "rejected";
    const matchesFilter = statusFilter === "All" || s === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "approved": 
      case "approve": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
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
                      <div className="text-xs text-brand-dark/60 font-mono">${order.amount}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-brand-dark/5 rounded-md text-brand-dark/80 uppercase">
                          {order.paymentMethod}
                        </span>
                        {order.paymentScreenshotUrl && (
                          <button 
                            onClick={() => setScreenshotModal(order.paymentScreenshotUrl!)}
                            className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
                            title="View receipt screenshot"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
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

  const renderCategories = () => {
    const filteredCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingCategory({
                id: "",
                name: "",
                slug: "",
                displayOrder: categories.length + 1,
                status: "Active"
              });
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium text-sm hover:bg-brand-accent transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-brand-dark/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-brand-dark/[0.02] border-b border-brand-dark/5">
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider w-16">Order</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Category Name</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Slug</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider text-center">Products</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Created</th>
                  <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/5">
                {categoriesLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-dark/40 text-sm">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-brand-dark/40">
                      <SearchX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium">No categories found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => {
                    const productCount = products.filter(p => p.category === cat.id || p.category === cat.slug).length;
                    return (
                      <tr key={cat.id} className="hover:bg-brand-dark/[0.01] transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm text-brand-dark/60">{cat.displayOrder}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-brand-dark">{cat.name}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-mono text-brand-dark/60">{cat.slug}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg bg-brand-dark/5 text-xs font-bold text-brand-dark/80">
                            {productCount}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                             cat.status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-brand-dark/10 text-brand-dark/70 border-brand-dark/20"
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-brand-dark/80 whitespace-nowrap">
                            {cat.createdAt instanceof Date ? cat.createdAt.toLocaleDateString() : cat.createdAt?.seconds ? new Date(cat.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-brand-dark/5 text-brand-dark/60 hover:text-brand-primary transition-colors inline-flex"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCategoryModal(cat)}
                            className="p-2 rounded-lg hover:bg-red-50 text-brand-dark/60 hover:text-red-600 transition-colors inline-flex"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
                className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  productStatusFilter === status 
                    ? "bg-brand-dark text-white shadow-md" 
                    : "text-brand-dark/60 hover:bg-brand-dark/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => {
          setEditingProduct({
            id: "",
            name: "",
            slug: "",
            shortDescription: "",
            fullDescription: "",
            category: "sound-effects",
            thumbnail: "",
            galleryImages: [],
            previewVideo: "",
            status: "Draft",
            priceUsd: 0,
            priceInr: 0,
            downloadCount: 0,
            fileSize: "",
            commercialRights: false,
            faqs: [],
            downloadLink: "",
            tutorialLink: "",
            metaTitle: "",
            metaDescription: ""
          });
          setCurrentPage("edit-product");
        }}
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
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Rank</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Last Updated</th>
                <th className="p-4 text-xs font-bold text-brand-dark/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {productsLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-dark/40 text-sm">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-brand-dark/40">
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
                        {product.thumbnail ? (
                           <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                           <ImageIcon className="w-5 h-5 m-2.5 text-brand-dark/40" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-brand-dark">{product.name}</div>
                      <div className="text-xs text-brand-dark/50">{categories.find(c => c.id === product.category || c.slug === product.category)?.name || product.category}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-brand-dark/80">${product.priceUsd?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-brand-dark/80">₹{product.priceInr?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-brand-dark/80">{product.rank || "-"}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                         product.status === "Published" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}>
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
                        onClick={() => {
                          setEditingProduct(product);
                          setCurrentPage("edit-product");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark/5 text-brand-dark hover:bg-brand-dark/10 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteProductModal(product)}
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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    try {
      const isNew = !editingProduct.id;
      const productId = isNew ? editingProduct.slug || Date.now().toString() : editingProduct.id;
      const productRef = doc(db, "products", productId);
      
      const productDataToSave = {
        ...editingProduct,
        id: productId,
        updatedAt: new Date()
      };
      
      if (isNew) {
        productDataToSave.createdAt = new Date();
      }
      
      await setDoc(productRef, productDataToSave, { merge: true });
      showToast("Product saved successfully!", "success");
      setCurrentPage("products");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    // Validation
    const name = editingCategory.name.trim();
    if (!name) {
      showToast("Category name cannot be empty", "error");
      return;
    }
    
    const isNew = !editingCategory.id;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check for duplicate name/slug
    const duplicate = categories.find(c => (c.name.toLowerCase() === name.toLowerCase() || c.slug === slug) && c.id !== editingCategory.id);
    if (duplicate) {
      showToast("A category with this name already exists", "error");
      return;
    }
    
    setLoading(true);
    try {
      const categoryId = isNew ? slug || Date.now().toString() : editingCategory.id;
      const categoryRef = doc(db, "categories", categoryId);
      
      const categoryDataToSave = {
        ...editingCategory,
        name,
        slug,
        id: categoryId,
        updatedAt: new Date()
      };
      
      if (isNew) {
        categoryDataToSave.createdAt = new Date();
        categoryDataToSave.displayOrder = categories.length + 1;
      }
      
      await setDoc(categoryRef, categoryDataToSave, { merge: true });
      showToast("Category saved successfully!", "success");
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("Failed to save category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryModal) return;
    
    // Check if products are using this category
    const productsUsingCategory = products.filter(p => p.category === deleteCategoryModal.id || p.category === deleteCategoryModal.slug);
    
    if (productsUsingCategory.length > 0) {
      if (!deleteCategoryAction) {
        showToast("Please select an action for the existing products.", "error");
        return;
      }
      
      if (deleteCategoryAction === "move" && !replacementCategoryId) {
        showToast("Please select a replacement category.", "error");
        return;
      }
    }

    setLoading(true);
    try {
      if (productsUsingCategory.length > 0) {
        if (deleteCategoryAction === "move") {
          // Move products
          for (const product of productsUsingCategory) {
            await updateDoc(doc(db, "products", product.id), {
              category: replacementCategoryId
            });
          }
        } else if (deleteCategoryAction === "delete") {
          // Delete products
          for (const product of productsUsingCategory) {
            await deleteDoc(doc(db, "products", product.id));
          }
        }
      }

      await deleteDoc(doc(db, "categories", deleteCategoryModal.id));
      showToast("Category deleted successfully", "success");
      setDeleteCategoryModal(null);
      setDeleteCategoryAction("");
      setReplacementCategoryId("");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("Failed to delete category", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderEditProduct = () => {
    if (!editingProduct) return null;
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl shadow-xl shadow-brand-dark/5 border border-brand-dark/5 overflow-hidden">
          <div className="p-6 border-b border-brand-dark/5 flex justify-between items-center bg-brand-dark/[0.02]">
            <h3 className="font-display font-bold text-xl text-brand-dark">
              {editingProduct.id ? "Edit Product" : "Add New Product"}
            </h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage("products");
                  setEditingProduct(null);
                }}
                className="px-4 py-2 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium text-sm hover:bg-brand-accent transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Product
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {/* General */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">General</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug}
                    onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Category</label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={e => setEditingProduct({...editingProduct, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Total Downloads</label>
                  <input
                    type="number"
                    value={editingProduct.downloadCount || 0}
                    onChange={e => setEditingProduct({...editingProduct, downloadCount: parseInt(e.target.value, 10) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Rank (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={editingProduct.rank || 0}
                    onChange={e => setEditingProduct({...editingProduct, rank: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">File Size (e.g., 2.5 GB)</label>
                  <input
                    type="text"
                    value={editingProduct.fileSize || ""}
                    onChange={e => setEditingProduct({...editingProduct, fileSize: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2 md:col-span-2">
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
                </div>
              </div>
            </section>
            
            {/* Pricing */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40 font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.priceUsd}
                      onChange={e => setEditingProduct({...editingProduct, priceUsd: parseFloat(e.target.value) || 0})}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Price (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40 font-medium">₹</span>
                    <input
                      type="number"
                      step="1"
                      required
                      value={editingProduct.priceInr}
                      onChange={e => setEditingProduct({...editingProduct, priceInr: parseInt(e.target.value) || 0})}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </section>
            
            {/* Descriptions */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">Descriptions</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.shortDescription}
                    onChange={e => setEditingProduct({...editingProduct, shortDescription: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Full Description (Markdown supported)</label>
                  <textarea
                    rows={6}
                    value={editingProduct.fullDescription}
                    onChange={e => setEditingProduct({...editingProduct, fullDescription: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </section>
            
            {/* Media */}
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
                    placeholder="Download:\nhttps://....\n\nTutorial:\nhttps://....\n\nDiscord:\nhttps://...."
                    className="w-full px-4 py-2 rounded-xl border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y"
                  ></textarea>
                </div>
              </div>
            </section>

            {/* FAQ */}
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
            
            {/* SEO */}
            <section>
              <h4 className="font-bold text-brand-dark mb-4 pb-2 border-b border-brand-dark/5">SEO</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={editingProduct.metaTitle || ""}
                    onChange={e => setEditingProduct({...editingProduct, metaTitle: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark/80 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.metaDescription || ""}
                    onChange={e => setEditingProduct({...editingProduct, metaDescription: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex">
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
            <button aria-label="Close screenshot modal" onClick={() => setScreenshotModal(null)} className="absolute -top-12 right-0 text-white hover:text-brand-primary p-2">
              <XCircle className="w-8 h-8" />
            </button>
            <img src={screenshotModal} alt="Payment Screenshot" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-dark/10">
            <div className="p-6 border-b border-brand-dark/5 flex justify-between items-center bg-brand-dark/[0.02]">
              <h3 className="font-display font-bold text-lg text-brand-dark">
                {editingCategory.id ? "Edit Category" : "Add Category"}
              </h3>
              <button 
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-brand-dark/40 hover:text-brand-dark transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark/80 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                  placeholder="e.g. Motion Presets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark/80 mb-1">Display Order</label>
                <input
                  type="number"
                  required
                  value={editingCategory.displayOrder}
                  onChange={e => setEditingCategory({...editingCategory, displayOrder: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark/80 mb-1">Status</label>
                <select
                  value={editingCategory.status}
                  onChange={e => setEditingCategory({...editingCategory, status: e.target.value as any})}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-dark/10 bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-medium text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deleteCategoryModal && (() => {
        const productsUsingCategory = products.filter(p => p.category === deleteCategoryModal.id || p.category === deleteCategoryModal.slug);
        const hasProducts = productsUsingCategory.length > 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-brand-dark/10 text-center text-left">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-display font-bold text-xl text-brand-dark mb-2 text-center">Delete Category</h3>
              
              {hasProducts ? (
                <div className="text-left space-y-4 mb-6">
                  <p className="text-brand-dark/80 text-sm font-medium p-3 bg-red-50 text-red-800 rounded-xl border border-red-100">
                    This category contains {productsUsingCategory.length} product(s). What would you like to do?
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-brand-dark/10 rounded-xl cursor-pointer hover:bg-brand-dark/5 transition-colors">
                      <input 
                        type="radio" 
                        name="deleteAction" 
                        value="move"
                        checked={deleteCategoryAction === "move"}
                        onChange={() => setDeleteCategoryAction("move")}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-brand-dark">Move products</div>
                        <div className="text-xs text-brand-dark/60">Move all associated products to another category</div>
                        {deleteCategoryAction === "move" && (
                          <select 
                            value={replacementCategoryId}
                            onChange={(e) => setReplacementCategoryId(e.target.value)}
                            className="w-full mt-2 px-3 py-2 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                          >
                            <option value="" disabled>Select a category...</option>
                            {categories.filter(c => c.id !== deleteCategoryModal.id).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 p-3 border border-red-200 bg-red-50/50 rounded-xl cursor-pointer hover:bg-red-50 transition-colors">
                      <input 
                        type="radio" 
                        name="deleteAction" 
                        value="delete"
                        checked={deleteCategoryAction === "delete"}
                        onChange={() => setDeleteCategoryAction("delete")}
                        className="mt-0.5 accent-red-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-red-700">Delete category and all products</div>
                        <div className="text-xs text-red-600/70">Warning: This action is irreversible</div>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="text-brand-dark/60 text-sm mb-6 text-center">
                  Are you sure you want to delete the category "{deleteCategoryModal.name}"?
                </p>
              )}
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setDeleteCategoryModal(null);
                    setDeleteCategoryAction("");
                    setReplacementCategoryId("");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-brand-dark/10 text-brand-dark font-medium hover:bg-brand-dark/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteCategory}
                  disabled={loading || (hasProducts && !deleteCategoryAction) || (deleteCategoryAction === "move" && !replacementCategoryId)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      
      
      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const activeProductForOrder = products.find(p => p.id === confirmModal.order.productId);
        
        const replaceVars = (text: string) => {
          if (!text) return "";
          return text
            .replace(/\{\{customer_name\}\}/g, confirmModal.order.customerName || "")
            .replace(/\{\{customer_email\}\}/g, confirmModal.order.email || "")
            .replace(/\{\{product_name\}\}/g, activeProductForOrder?.name || confirmModal.order.productName || "")
            .replace(/\{\{order_id\}\}/g, confirmModal.order.orderId || "")
            .replace(/\{\{payment_method\}\}/g, confirmModal.order.paymentMethod || "")
            .replace(/\{\{price\}\}/g, confirmModal.order.amount?.toString() || "");
        };

        const rawSubject = activeProductForOrder?.emailSubject || `Thanks for purchasing ${activeProductForOrder?.name || confirmModal.order.productName}`;
        const productBody = activeProductForOrder?.emailBody || `Download:\n${activeProductForOrder?.downloadLink || "No link"}${activeProductForOrder?.tutorialLink ? `\n\nTutorial:\n${activeProductForOrder.tutorialLink}` : ""}`;
        const rawBody = `Hi {{customer_name}},\n\n${productBody}\n\nThank you,\nEditors Hub Store`;

        const defaultSubject = replaceVars(rawSubject);
        const defaultBody = replaceVars(rawBody);

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
                  {approvalMessageType === "default" ? (
                    <button
                      onClick={() => {
                        setCustomEmailSubject(defaultSubject);
                        setCustomEmailBody(defaultBody);
                        setApprovalMessageType("custom");
                      }}
                      className="text-brand-primary text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      <Edit className="w-4 h-4" /> Edit Message
                    </button>
                  ) : (
                    <div className="space-y-3 bg-brand-dark/[0.02] p-4 rounded-xl border border-brand-dark/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-brand-dark/60 uppercase tracking-wider">Email Message</span>
                        <button
                          onClick={() => {
                            setApprovalMessageType("default");
                          }}
                          className="text-brand-dark/40 hover:text-brand-dark text-xs font-medium"
                        >
                          Cancel Edit
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Subject</label>
                        <input
                          type="text"
                          value={customEmailSubject}
                          onChange={(e) => setCustomEmailSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-dark/60 uppercase tracking-wider mb-1">Body</label>
                        <textarea
                          value={customEmailBody}
                          onChange={(e) => setCustomEmailBody(e.target.value)}
                          rows={6}
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
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold tracking-wider text-sm transition-colors
                    ${confirmModal.action === "Approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
                >
                  Yes, {confirmModal.action}
                </button>
              </div>
            </div>
          </div>
        );
      })()}



      
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPage === "orders" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Orders
          </button>
          <button 
            onClick={() => setCurrentPage("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPage === "products" || currentPage === "edit-product" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button 
            onClick={() => setCurrentPage("categories")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPage === "categories" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }`}
          >
            <Filter className="w-5 h-5" />
            Categories
          </button>
          <button 
            onClick={() => setCurrentPage("omnitool-users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              currentPage === "omnitool-users" ? "bg-brand-dark text-white shadow-md" : "text-brand-dark/60 hover:bg-brand-dark/5"
            }`}
          >
            <Users className="w-5 h-5" />
            OmniTool Users
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
             {currentPage === "orders" ? "Orders" : currentPage === "edit-product" ? "Edit Product" : currentPage === "categories" ? "Categories" : currentPage === "omnitool-users" ? "OmniTool Users" : "Products"}
           </h2>
        </header>
        
        <main className="flex-1 bg-brand-bg">
           {currentPage === "orders" ? renderOrders() : currentPage === "edit-product" ? renderEditProduct() : currentPage === "categories" ? renderCategories() : currentPage === "omnitool-users" ? (
             <div className="p-8"><OmniToolUsers /></div>
           ) : renderProducts()}
        </main>
      </div>
    </div>
  );
}

