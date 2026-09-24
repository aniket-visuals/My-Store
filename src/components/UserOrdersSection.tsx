import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  ShoppingBag,
  Eye,
  X,
  Calendar
} from "lucide-react";
import { Product } from "../types";

export interface UserOrder {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  productId: string;
  productName: string;
  productImage?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentScreenshotUrl?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any;
  country?: string;
  discordOrTelegramUsername?: string;
  autoApprove?: boolean;
}

interface UserOrdersSectionProps {
  user: any;
  onClose?: () => void;
  onNavigateToSupport?: () => void;
}

// High-fidelity branded software / asset logo renderer
const ProductThumbnail: React.FC<{
  productName: string;
  imageUrl?: string;
  className?: string;
}> = ({ productName, imageUrl, className = "w-16 h-16" }) => {
  const [hasError, setHasError] = useState(false);
  const nameLower = (productName || "").toLowerCase();

  // If a valid image URL exists (and not the generic unsplash fallback placeholder)
  const isValidCustomImage =
    imageUrl &&
    imageUrl.trim() !== "" &&
    !hasError &&
    !imageUrl.includes("photo-1618005182384");

  if (isValidCustomImage) {
    return (
      <div className={`${className} rounded-xl overflow-hidden bg-black/5 border border-black/5 shrink-0 relative shadow-xs`}>
        <img
          src={imageUrl}
          alt={productName}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Authentic branded software badges when thumbnail is missing or loading fails
  if (nameLower.includes("media encoder") || nameLower.includes("encoder")) {
    return (
      <div className={`${className} rounded-xl bg-[#0a0b18] border border-[#ff40c6]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff40c6]/25 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-2xl tracking-tighter text-[#ff40c6] leading-none drop-shadow-sm">
          Me
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          Encoder
        </span>
      </div>
    );
  }

  if (nameLower.includes("after effect")) {
    return (
      <div className={`${className} rounded-xl bg-[#060618] border border-[#9999ff]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#9999ff]/25 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-2xl tracking-tighter text-[#9999ff] leading-none drop-shadow-sm">
          Ae
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          Effects
        </span>
      </div>
    );
  }

  if (nameLower.includes("premiere")) {
    return (
      <div className={`${className} rounded-xl bg-[#0a0618] border border-[#ea77ff]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ea77ff]/25 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-2xl tracking-tighter text-[#ea77ff] leading-none drop-shadow-sm">
          Pr
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          Premiere
        </span>
      </div>
    );
  }

  if (nameLower.includes("photoshop")) {
    return (
      <div className={`${className} rounded-xl bg-[#030e22] border border-[#31a8ff]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#31a8ff]/25 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-2xl tracking-tighter text-[#31a8ff] leading-none drop-shadow-sm">
          Ps
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          Photoshop
        </span>
      </div>
    );
  }

  if (nameLower.includes("illustrator")) {
    return (
      <div className={`${className} rounded-xl bg-[#1f0d00] border border-[#ff9a00]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff9a00]/25 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-2xl tracking-tighter text-[#ff9a00] leading-none drop-shadow-sm">
          Ai
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          Illustrator
        </span>
      </div>
    );
  }

  if (nameLower.includes("davinci") || nameLower.includes("resolve")) {
    return (
      <div className={`${className} rounded-xl bg-[#14151a] border border-[#ff5555]/40 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-xs select-none group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff5555]/20 via-transparent to-transparent pointer-events-none" />
        <span className="font-sans font-black text-xl tracking-tighter text-white leading-none">
          DVR
        </span>
        <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/70 mt-1">
          DaVinci
        </span>
      </div>
    );
  }

  // Fallback for custom assets, plugins, sound packs
  return (
    <div className={`${className} rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex flex-col items-center justify-center text-brand-primary shrink-0 select-none`}>
      <Package className="w-7 h-7" />
      <span className="text-[7px] font-mono font-bold uppercase tracking-wider mt-0.5 text-brand-primary/80">
        Asset
      </span>
    </div>
  );
};

export const UserOrdersSection: React.FC<UserOrdersSectionProps> = ({
  user,
  onClose,
  onNavigateToSupport,
}) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Fetch orders belonging to this user
  const fetchUserOrders = async () => {
    if (!user?.uid && !user?.email) return;
    setIsLoading(true);

    try {
      // 1. Fetch products map for enriched data (downloadLink, images, slugs, thumbnails)
      try {
        const prodSnap = await getDocs(collection(db, "products"));
        const pMap: Record<string, Product> = {};
        prodSnap.forEach((d) => {
          const raw = d.data() as any;
          // Firestore products typically store the logo/image in `thumbnail`
          const resolvedImg =
            raw.thumbnail ||
            raw.image ||
            raw.previewImage ||
            (raw.galleryImages && raw.galleryImages[0]) ||
            "";

          const productObj: Product = {
            id: d.id,
            name: raw.name || "",
            slug: raw.slug || "",
            price: raw.priceUsd ?? raw.price ?? 0,
            priceInr: raw.priceInr ?? 0,
            category: raw.category || "Assets",
            image: resolvedImg,
            thumbnail: resolvedImg,
            downloadLink: raw.downloadLink || "",
            tutorialLink: raw.tutorialLink || "",
            autoApprove: raw.autoApprove || false,
            ...raw,
          } as Product;

          // Map by Firestore doc id
          pMap[d.id] = productObj;
          // Map by slug
          if (raw.slug) pMap[raw.slug] = productObj;
          // Map by id field if exists
          if (raw.id) pMap[raw.id] = productObj;
          // Map by normalized product name for resilient lookup
          if (raw.name) {
            pMap[raw.name.toLowerCase().trim()] = productObj;
          }
        });
        setProductsMap(pMap);
      } catch (prodErr) {
        console.warn("Could not fetch products catalog for enrichment:", prodErr);
      }

      // 2. Query user orders
      const ordersMap = new Map<string, UserOrder>();

      // Query by userId
      if (user?.uid) {
        try {
          const qUid = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          const snapUid = await getDocs(qUid);
          snapUid.forEach((d) => {
            ordersMap.set(d.id, { id: d.id, ...d.data() } as UserOrder);
          });
        } catch (uidErr) {
          console.warn("Error querying orders by userId:", uidErr);
        }
      }

      // Query by user email fallback (for orders placed prior to or without UID)
      if (user?.email) {
        try {
          const qEmail = query(
            collection(db, "orders"),
            where("email", "==", user.email.toLowerCase().trim())
          );
          const snapEmail = await getDocs(qEmail);
          snapEmail.forEach((d) => {
            if (!ordersMap.has(d.id)) {
              ordersMap.set(d.id, { id: d.id, ...d.data() } as UserOrder);
            }
          });
        } catch (emailErr) {
          console.warn("Error querying orders by email:", emailErr);
        }
      }

      // Convert map to array and sort descending by createdAt
      const ordersList = Array.from(ordersMap.values()).sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      setOrders(ordersList);
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user?.uid, user?.email]);

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (rawDate: any): string => {
    if (!rawDate) return "Recent";
    try {
      const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate.seconds ? rawDate.seconds * 1000 : rawDate);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "All" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesSearch =
      searchTerm.trim() === "" ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase().trim());

    return matchesStatus && matchesSearch;
  });

  const countByStatus = {
    All: orders.length,
    Pending: orders.filter((o) => o.status === "Pending").length,
    Approved: orders.filter((o) => o.status === "Approved").length,
    Rejected: orders.filter((o) => o.status === "Rejected").length,
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-black/[0.03] rounded-xl overflow-x-auto shrink-0 scrollbar-none">
            {(["All", "Approved", "Pending", "Rejected"] as const).map((status) => {
              const count = countByStatus[status];
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-brand-dark shadow-xs font-bold"
                      : "text-brand-muted hover:text-brand-dark hover:bg-black/[0.02]"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : status === "Rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-black/10 text-brand-dark"
                        : "bg-black/5 text-black/50"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Refresh & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                placeholder="Search orders or assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/[0.02] border border-black/5 rounded-xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={fetchUserOrders}
              disabled={isLoading}
              title="Refresh orders"
              className="p-2 rounded-xl border border-black/5 hover:bg-black/5 text-black/60 hover:text-black transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List / Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-black/5 p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-black/5 rounded-md w-36" />
                <div className="h-6 bg-black/5 rounded-full w-24" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-black/5 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-black/5 rounded-md w-48" />
                  <div className="h-3 bg-black/5 rounded-md w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-display font-bold text-lg text-brand-dark">
              {orders.length === 0
                ? "No Orders Found"
                : `No ${statusFilter} Orders`}
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              {orders.length === 0
                ? "You haven't placed any orders yet. Discover our premium creator tools, sound effects, and visual presets."
                : `You don't have any orders matching the "${statusFilter}" status filter.`}
            </p>
          </div>

          {orders.length === 0 ? (
            <button
              onClick={() => {
                if (onClose) onClose();
                navigate("/");
                setTimeout(() => {
                  const el = document.getElementById("shop");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setStatusFilter("All");
                setSearchTerm("");
              }}
              className="text-xs font-mono font-bold text-brand-primary hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            // Resilient product lookup by id, slug, or normalized name
            const product =
              productsMap[order.productId] ||
              (order.productName ? productsMap[order.productName.toLowerCase().trim()] : undefined);

            const isApproved = order.status === "Approved";
            const isPending = order.status === "Pending";
            const isRejected = order.status === "Rejected";
            const isExpanded = expandedOrderId === order.id;

            // Resolved download link (from order or from catalog product)
            const downloadUrl = (order as any).downloadLink || product?.downloadLink || "";
            const productSlug = product?.slug || "";

            // Resolved image from order or product
            const productImage =
              order.productImage ||
              product?.image ||
              product?.thumbnail ||
              "";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm transition-all hover:border-black/10"
              >
                {/* Header Row: Order ID, Date, Status */}
                <div className="px-5 py-4 bg-black/[0.015] border-b border-black/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-brand-dark">
                        #{order.orderId || order.id.slice(0, 8)}
                      </span>
                      <button
                        onClick={() => copyOrderId(order.orderId || order.id)}
                        title="Copy Order ID"
                        className="text-black/40 hover:text-brand-dark p-1 rounded transition-colors cursor-pointer"
                      >
                        {copiedId === (order.orderId || order.id) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-black/20">•</span>

                    <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isApproved && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved</span>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.2 rounded-full font-mono font-semibold ml-0.5">
                          Ready
                        </span>
                      </div>
                    )}
                    {isPending && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold tracking-wide">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Pending Verification</span>
                      </div>
                    )}
                    {isRejected && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-bold tracking-wide">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Product preview and info */}
                    <div className="flex items-center gap-4">
                      {/* Product Thumbnail / Software Logo */}
                      <ProductThumbnail
                        productName={order.productName}
                        imageUrl={productImage}
                        className="w-16 h-16"
                      />

                      <div className="space-y-1 min-w-0">
                        <h4 className="font-display font-bold text-base text-brand-dark leading-tight">
                          {order.productName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                          <span className="font-bold text-brand-dark font-mono">
                            {order.amount === 0 ? "FREE" : `${order.currency} ${order.amount}`}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{order.paymentMethod || "Direct"}</span>
                          {productSlug && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => {
                                  if (onClose) onClose();
                                  navigate(`/products/${productSlug}`);
                                }}
                                className="text-brand-primary hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                View Product
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                        className="text-xs font-mono font-semibold text-brand-muted hover:text-brand-dark px-2.5 py-1.5 rounded-lg hover:bg-black/[0.03] transition-colors cursor-pointer"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </div>

                  {/* Contextual Status Banner */}
                  {isPending && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 leading-relaxed">
                        <p className="font-semibold">Verification typically completes within 1 hour</p>
                        <p className="text-[11px] text-amber-800/80">
                          Our team is currently verifying your transaction. Once confirmed, your instant download link will be available here and dispatched to <strong>{order.email}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {isRejected && (
                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-900 text-xs flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 leading-relaxed">
                          <p className="font-semibold">Order Could Not Be Verified</p>
                          <p className="text-[11px] text-rose-800/80">
                            We could not verify the payment confirmation. If your payment went through or if you uploaded an incorrect screenshot, please contact support.
                          </p>
                        </div>
                      </div>
                      {onNavigateToSupport && (
                        <button
                          onClick={onNavigateToSupport}
                          className="shrink-0 text-xs font-mono font-bold text-rose-800 hover:underline cursor-pointer"
                        >
                          Support
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expandable Order Details Drawer */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-150">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40 block mb-1">
                          Customer
                        </span>
                        <p className="font-semibold text-brand-dark">{order.customerName}</p>
                        <p className="text-brand-muted truncate">{order.email}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40 block mb-1">
                          Payment Details
                        </span>
                        <p className="font-semibold text-brand-dark capitalize">
                          {order.paymentMethod || "Standard"} • {order.currency} {order.amount}
                        </p>
                        <p className="text-brand-muted">
                          {order.country ? `Country: ${order.country}` : "Global Order"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40 block mb-1">
                          Payment Proof
                        </span>
                        {order.paymentScreenshotUrl ? (
                          <button
                            onClick={() => setPreviewScreenshotUrl(order.paymentScreenshotUrl!)}
                            className="inline-flex items-center gap-1.5 text-brand-primary hover:underline font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Uploaded Proof</span>
                          </button>
                        ) : (
                          <span className="text-brand-muted italic">No screenshot required (Free/Auto)</span>
                        )}
                      </div>

                      {isApproved && downloadUrl && (
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40 block mb-1">
                            Asset Link
                          </span>
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-brand-primary hover:underline font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Access Asset</span>
                          </a>
                        </div>
                      )}

                      {order.discordOrTelegramUsername && (
                        <div className="sm:col-span-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40 block mb-1">
                            Discord / Telegram Handle
                          </span>
                          <p className="font-mono text-brand-dark font-medium">
                            {order.discordOrTelegramUsername}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 overflow-hidden shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark">
                Uploaded Payment Screenshot
              </span>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="text-black/40 hover:text-black p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-black/5 bg-black/5 flex items-center justify-center">
              <img
                src={previewScreenshotUrl}
                alt="Payment Proof"
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrdersSection;
