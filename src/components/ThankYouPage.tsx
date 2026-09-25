import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Copy, ArrowRight, ArrowLeft, X, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { updateMetaTags } from "../utils/seo";

export interface OrderSubmissionData {
  orderId?: string;
  email?: string;
  paymentMethod?: string;
  paymentMethodKey?: string;
  total?: string;
  dateTime?: string;
  productName?: string;
  productSlug?: string;
  productId?: string;
  isAutoApprove?: boolean;
}

export interface ThankYouPageProps {
  orderData?: OrderSubmissionData | null;
  isOpen?: boolean;
  onClose?: () => void;
}

function GmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      {/* Google Gmail Multi-color Logo */}
      <path fill="#4285F4" d="M2.5 19.5h3.5v-9.6L2.5 7.2v12.3z" />
      <path fill="#34A853" d="M21.5 19.5h-3.5v-9.6l3.5-2.7v12.3z" />
      <path fill="#EA4335" d="M18 7.2l-6 4.6-6-4.6V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2.2z" />
      <path fill="#FBBC04" d="M2.5 7.2L6 9.9V5c0-.6.3-1.2.8-1.5L2.5 7.2z" />
      <path fill="#C5221F" d="M21.5 7.2L18 9.9V5c0-.6-.3-1.2-.8-1.5l4.3 3.7z" />
    </svg>
  );
}

export default function ThankYouPage({
  orderData,
  isOpen = true,
  onClose
}: ThankYouPageProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updateMetaTags({
      title: "Order Submitted — Editors Hub Store",
      description: "Your order has been successfully submitted.",
      url: "https://www.editorshubstore.in/thank-you"
    });
  }, []);

  const routeState = location.state as OrderSubmissionData | null;
  const activeOrder = orderData || routeState;

  // Persist last order so refreshing doesn't cause empty redirect
  useEffect(() => {
    if (activeOrder?.orderId) {
      try {
        sessionStorage.setItem("eh_last_order", JSON.stringify(activeOrder));
      } catch {
        // ignore storage errors
      }
    }
  }, [activeOrder]);

  const savedOrder = React.useMemo(() => {
    if (activeOrder?.orderId) return activeOrder;
    try {
      const stored = sessionStorage.getItem("eh_last_order");
      if (stored) return JSON.parse(stored) as OrderSubmissionData;
    } catch {
      // ignore
    }
    return null;
  }, [activeOrder]);

  const orderId = savedOrder?.orderId || "EH-" + Math.floor(100000 + Math.random() * 900000);
  const email = savedOrder?.email || "";
  const paymentMethod = savedOrder?.paymentMethod || "UPI (India)";
  const paymentMethodKey = savedOrder?.paymentMethodKey || "upi";
  const total = savedOrder?.total || "₹ 999";

  const dateTime = React.useMemo(() => {
    if (savedOrder?.dateTime) return savedOrder.dateTime;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear().toString().slice(-2)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }, [savedOrder?.dateTime]);

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isMobile = isAndroid || isIOS || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    if (isAndroid) {
      e.preventDefault();
      // On Android mobile: launch the official Gmail app intent with automatic web fallback
      window.location.href =
        "intent://#Intent;package=com.google.android.gm;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fmail.google.com;end";
    } else if (isIOS) {
      e.preventDefault();
      // On iOS mobile: attempt deep-link to the Gmail app with fallback to web mail
      let appOpened = false;
      const onVisibilityChange = () => {
        if (document.hidden) appOpened = true;
      };
      document.addEventListener("visibilitychange", onVisibilityChange, { once: true });

      window.location.href = "googlegmail://";

      setTimeout(() => {
        if (!appOpened && !document.hidden) {
          window.location.href = "https://mail.google.com";
        }
      }, 1200);
    } else if (isMobile) {
      e.preventDefault();
      window.location.href = "https://mail.google.com";
    } else {
      // Desktop / PC Browser: standard link action opens gmail.com in a new tab via target="_blank"
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGoToReview = () => {
    if (onClose) {
      onClose();
    }

    const productSlug = savedOrder?.productSlug;
    if (productSlug) {
      // If we are already on that product's page, simply reveal & scroll
      if (location.pathname === `/products/${productSlug}`) {
        window.location.hash = "reviews";
        setTimeout(() => {
          const el = document.getElementById("reviews");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      } else {
        navigate(`/products/${productSlug}#reviews`, { state: { openReview: true } });
      }
    } else {
      const el = document.getElementById("reviews");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate("/#reviews");
      }
    }
  };

  // Keyboard navigation (Esc to close) and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Payment method icon helper
  const renderPaymentIcon = () => {
    const key = paymentMethodKey.toLowerCase();
    const methodStr = paymentMethod.toLowerCase();

    if (methodStr.includes("free") || total === "FREE") {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    if (key === "upi" || methodStr.includes("upi")) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#5f259f] text-[10px] font-mono font-bold text-white leading-none">
          U
        </span>
      );
    }
    if (key === "paypal" || methodStr.includes("paypal")) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#0070ba] text-[11px] font-black italic text-white leading-none">
          P
        </span>
      );
    }
    if (key === "apple" || methodStr.includes("apple")) {
      return (
        <svg viewBox="0 0 170 170" className="w-4 h-4 fill-current text-neutral-900" aria-label="Apple Pay">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-8.08-12.24-15.01-6.19-9.58-11.05-20.44-14.59-32.58-3.53-12.14-5.3-23.79-5.3-34.95 0-16.14 4.13-29.47 12.38-40.02 8.25-10.55 18.79-15.93 31.62-16.15 4.81 0 10.15 1.25 16.03 3.75 5.88 2.5 9.77 3.82 11.67 3.97 1.48-.15 5.61-1.55 12.39-4.2 6.78-2.65 12.57-3.79 17.38-3.41 13.48.65 24.36 5.84 32.65 15.58-11.96 7.23-17.84 17.16-17.65 29.78.19 9.87 3.95 18.23 11.28 25.07 7.33 6.85 16.08 10.74 26.24 11.68-2.5 7.6-5.59 15.34-9.27 23.23zM119.22 33.6c0-7.79 2.77-15.11 8.31-21.96 5.54-6.85 12.36-11.16 20.47-12.93.42 2.08.63 4.08.63 6 0 7.79-2.85 15.26-8.55 22.42-5.7 7.15-12.63 11.45-20.78 12.89-.08-1.56-.08-3.7-.08-6.42z" />
        </svg>
      );
    }
    return <CreditCard className="w-4 h-4 text-neutral-700" />;
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="thankyou-modal-title"
        className="relative w-full max-w-[420px] bg-white rounded-3xl sm:rounded-[32px] shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 border border-black/5 my-auto"
      >
        {/* Close Button at top-right */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          title="Close (Esc)"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scalloped Green Rosette Badge with Checkmark */}
        <div className="flex justify-center mb-5 pt-1">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
            {/* 12-point rounded scalloped flower seal using multi-rotated rounded tiles */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-[18px] bg-[#6ee7b7] shadow-sm rotate-0 transition-transform" />
            <div className="absolute inset-0 rounded-2xl sm:rounded-[18px] bg-[#6ee7b7] shadow-sm rotate-[30deg] transition-transform" />
            <div className="absolute inset-0 rounded-2xl sm:rounded-[18px] bg-[#6ee7b7] shadow-sm rotate-[60deg] transition-transform" />
            
            {/* Dark green checkmark in center */}
            <Check className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 text-[#065f46] stroke-[3.5]" />
          </div>
        </div>

        {/* Headline */}
        <h2 
          id="thankyou-modal-title"
          className="text-xl sm:text-[22px] font-bold text-neutral-900 leading-snug tracking-tight mb-6 px-1"
        >
          Your order has been<br />successfully submitted
        </h2>

        {/* Receipt Details Box */}
        <div className="bg-[#f9fafb] border border-neutral-200/80 rounded-2xl p-4 sm:p-5 text-sm space-y-3.5 mb-6 text-left shadow-xs">
          
          {/* Order ID Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-500 font-medium text-xs sm:text-sm">Order ID</span>
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-xs sm:text-sm">
              <span className="font-mono">{orderId}</span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                title="Copy Order ID"
                className="p-1 hover:bg-neutral-200/80 rounded-md transition-colors text-neutral-500 hover:text-neutral-900 cursor-pointer"
                aria-label="Copy Order ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Method Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-500 font-medium text-xs sm:text-sm">Payment Method</span>
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-xs sm:text-sm">
              {renderPaymentIcon()}
              <span>{paymentMethod}</span>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-500 font-medium text-xs sm:text-sm">Date & Time</span>
            <span className="font-semibold text-neutral-900 text-xs sm:text-sm font-mono">
              {dateTime}
            </span>
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200/70">
            <span className="text-neutral-500 font-medium text-xs sm:text-sm">Total</span>
            <span className="font-bold text-neutral-900 text-base sm:text-lg">
              {total}
            </span>
          </div>

        </div>

        {/* Primary Action Button - Open Gmail */}
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenGmail}
          className="w-full bg-[#18181b] hover:bg-black text-white font-semibold text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer group no-underline"
        >
          <GmailIcon className="w-5 h-5 flex-shrink-0" />
          <span>Open Gmail</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-white/70" />
        </a>

        {/* Add Review Action Button */}
        <button
          type="button"
          onClick={handleGoToReview}
          className="w-full mt-2.5 bg-neutral-100 hover:bg-neutral-200/90 text-neutral-900 border border-neutral-200/90 font-semibold text-sm sm:text-base py-3.5 rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer group shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-brand-primary transition-transform group-hover:rotate-12" />
          <span>Add review</span>
          <ArrowRight className="w-4 h-4 text-neutral-500 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Secondary Back Link, My Account, & Email notice */}
        <div className="mt-4 pt-1 space-y-2">
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-neutral-500">
            <button
              type="button"
              onClick={handleClose}
              className="hover:text-neutral-900 transition-colors cursor-pointer inline-flex items-center gap-1 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
            <span className="text-neutral-300">•</span>
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                navigate("/portal");
              }}
              className="hover:text-neutral-900 transition-colors cursor-pointer inline-flex items-center gap-1 py-1"
            >
              Go to My Account
            </button>
          </div>
          
          {email && (
            <p className="text-[11px] text-neutral-400 font-normal leading-relaxed px-2">
              Receipt and download links have been dispatched to{" "}
              <span className="text-neutral-700 font-medium break-all">{email}</span>
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
}
