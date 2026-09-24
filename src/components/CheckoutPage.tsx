import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateMetaTags } from "../utils/seo";
import { 
  ArrowLeft, 
  Check, 
  Shield, 
  Upload, 
  Copy, 
  Info, 
  Clock, 
  Download, 
  Image as ImageIcon, 
  X,
  Loader2,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Product } from "../types";
import { uploadScreenshot, createOrder } from "../services/orderService";
import { sendApprovalEmail } from "../services/emailService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

type PaymentMethod = "upi" | "wise" | "paypal";

const PROCESSING_STEPS = [
  {
    short: "Validation",
    title: "Customer Details",
    desc: "Validating order parameters and credentials...",
  },
  {
    short: "Securing",
    title: "License & Assets",
    desc: "Securing download tokens and digital package...",
  },
  {
    short: "Dispatching",
    title: "Instant Delivery",
    desc: "Generating order receipt & delivery link...",
  },
];

export interface CheckoutPageProps {
  cart: Product[];
  clearCart: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CheckoutPage({ 
  cart, 
  clearCart, 
  isOpen = true, 
  onClose 
}: CheckoutPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      updateMetaTags({
        title: "Complete Order — Editors Hub Store",
        description: "Complete your purchase at Editors Hub Store.",
        url: "https://www.editorshubstore.in/checkout"
      });
    }
  }, [isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wise");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(15);
  const [processingStage, setProcessingStage] = useState(0);

  // Smooth animation progress timer during submission
  useEffect(() => {
    if (!isSubmitting) {
      setProgress(15);
      setProcessingStage(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) {
          setProcessingStage(0);
          return prev + 6;
        } else if (prev < 80) {
          setProcessingStage(1);
          return prev + 4;
        } else if (prev < 96) {
          setProcessingStage(2);
          return prev + 1.5;
        }
        return prev;
      });
    }, 240);

    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Auto-fill logged in user info if available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!email && user.email) setEmail(user.email);
        if (!fullName && user.displayName) setFullName(user.displayName);
      }
    });
    return () => unsubscribe();
  }, [email, fullName]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isSubmitting) {
          handleClose();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while processing order
    if (onClose) {
      onClose();
    } else {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  const product = cart.length > 0 ? cart[0] : null;
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  // Computed values
  const priceINR = cart.reduce((acc, item) => acc + (item.priceInr || item.price * 83), 0);
  
  const paymentDetails = {
    upi: {
      id: "6299830102@ptaxis",
      name: "UPI (India)",
      amount: `₹${priceINR > 0 ? priceINR.toFixed(2) : "0.00"}`,
      instruction: "Open your UPI app (GPay, PhonePe, Paytm, etc.), scan the QR code or enter the UPI ID to make the payment.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783354889/photo_2026-07-06_21-44-09_wojtrv.jpg"
    },
    wise: {
      id: "@ankitraj8",
      name: "Wise (International)",
      amount: `$${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}`,
      instruction: "Scan the Wise QR code or send payment directly to our Wise email address.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783355648/Wise_edq4d5.png"
    },
    paypal: {
      id: "@Gunjan188",
      name: "PayPal (International)",
      amount: `$${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}`,
      instruction: "Scan the PayPal QR code or send payment directly to our PayPal email address.",
      qrCode: "https://res.cloudinary.com/df5rgwdng/image/upload/v1783353147/paypal_a8raqu.png"
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(paymentDetails[paymentMethod].id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validation
  const isFormValid = 
    fullName.trim() !== "" && 
    email.trim() !== "" && 
    (product?.autoApprove || screenshot !== null);

  const handleOrderSubmit = async () => {
    if (!isFormValid || !product || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);
    setProgress(20);
    setProcessingStage(0);

    try {
      // 1. Upload screenshot to Cloudinary (if provided)
      let screenshotUrl = "";
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      setProcessingStage(1);

      // 2. Create order in Firestore
      const currency = paymentMethod === "upi" ? "INR" : "USD";
      const amount = paymentMethod === "upi" ? priceINR : totalPrice;

      const orderData = {
        customerName: fullName,
        email,
        paymentMethod: paymentMethod.toUpperCase(),
        currency,
        amount,
        paymentScreenshotUrl: screenshotUrl,
        productId: product.id,
        productName: product.name,
        autoApprove: product.autoApprove,
      };

      const orderId = await createOrder(orderData as any);

      setProcessingStage(2);

      // Send email notification to admin
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_email: 'admin@editorshubstore.in',
            subject: `New Order Received: ${orderId} for ${product.name}`,
            body: `You have received a new order.\n\nOrder ID: ${orderId}\nCustomer Name: ${fullName}\nEmail: ${email}\nProduct: ${product.name}\nAmount: ${currency} ${amount}\nPayment Method: ${paymentMethod.toUpperCase()}\n\nPlease check the admin dashboard for more details.`,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
      }

      // If auto-approved, send the product delivery email immediately to the customer
      if (product.autoApprove) {
        try {
          const replaceVariables = (text: string) => {
            if (!text) return "";
            return text
              .replace(/\{\{customer_name\}\}/g, fullName || "")
              .replace(/\{\{customer_email\}\}/g, email || "")
              .replace(/\{\{product_name\}\}/g, product.name || "")
              .replace(/\{\{order_id\}\}/g, orderId || "")
              .replace(/\{\{payment_method\}\}/g, paymentMethod.toUpperCase() || "")
              .replace(/\{\{price\}\}/g, amount?.toString() || "");
          };

          const rawSubject = product.emailSubject || `Thanks for purchasing ${product.name}`;
          const productBody = product.emailBody || `Download:\n${product.downloadLink || "No link"}${product.tutorialLink ? `\n\nTutorial:\n${product.tutorialLink}` : ""}`;
          const rawBody = `Hi {{customer_name}},\n\n${productBody}\n\nThank you,\nEditors Hub Store`;
          
          await sendApprovalEmail({
            to_email: email,
            to_name: fullName,
            order_id: orderId,
            product_name: product.name,
            download_link: product.downloadLink || "No link provided",
            subject: replaceVariables(rawSubject),
            body: replaceVariables(rawBody)
          });
        } catch (autoEmailErr) {
          console.error("Failed to send auto-approval email:", autoEmailErr);
        }
      }

      // Briefly show completion stage
      setProgress(100);
      setProcessingStage(3);
      await new Promise((resolve) => setTimeout(resolve, 650));

      const formattedTotal = product.price === 0 
        ? "FREE" 
        : paymentMethod === "upi" 
          ? `₹ ${priceINR.toFixed(0)}` 
          : `$ ${totalPrice}`;

      const paymentMethodLabel = product.price === 0 
        ? "Free Access" 
        : paymentMethod === "upi" 
          ? "UPI (India)" 
          : paymentMethod === "wise" 
            ? "Wise Transfer" 
            : "PayPal";

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const formattedDateTime = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear().toString().slice(-2)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      // 3. Clear cart & redirect to Thank You page
      clearCart();
      if (onClose) onClose();
      navigate("/thank-you", { 
        state: { 
          orderId, 
          email,
          paymentMethod: paymentMethodLabel,
          paymentMethodKey: paymentMethod,
          total: formattedTotal,
          dateTime: formattedDateTime,
          productName: product.name,
          isAutoApprove: Boolean(product.autoApprove)
        } 
      });

    } catch (err: any) {
      console.error("Failed to submit order:", err);
      setErrorMsg(err.message || "Failed to submit order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="relative w-full max-w-5xl bg-[#fafafa] rounded-2xl md:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-black/10 my-auto max-h-[92vh] flex flex-col overflow-hidden text-brand-dark animate-in zoom-in-95 duration-200"
      >
        {/* Popup Window Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 bg-white border-b border-brand-dark/10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleClose} 
              aria-label="Back" 
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-dark/50 hover:text-brand-primary uppercase tracking-wider transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-brand-dark/20 hidden sm:inline">|</span>
            <div>
              <h2 id="checkout-modal-title" className="font-display font-bold text-xl sm:text-2xl text-brand-dark leading-tight">
                Complete Order
              </h2>
              <p className="text-xs sm:text-sm text-brand-dark/60 font-sans">
                Fill in your details and complete the payment below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close popup window"
            title={isSubmitting ? "Processing order..." : "Close (Esc)"}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-dark/[0.04] hover:bg-brand-dark/10 border border-brand-dark/10 flex items-center justify-center text-brand-dark/60 hover:text-brand-dark transition-all cursor-pointer shadow-sm shrink-0 ${
              isSubmitting ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Processing Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/96 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300 select-none">
            <div className="max-w-md w-full flex flex-col items-center space-y-6">
              
              {/* Animated Orbital Spinner with Central Pulsing Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                {/* Outer spinning glowing gradient circle */}
                <div className="absolute inset-0 rounded-full border-4 border-brand-primary/15 border-t-brand-primary border-r-brand-accent animate-spin" />
                {/* Slow dashed ambient ring */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-brand-dark/15 animate-spin-slow" />
                {/* Center Badge with Stage Icon */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-brand-primary/10 flex items-center justify-center shadow-inner animate-pulse-glow">
                  {processingStage === 3 ? (
                    <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-500 animate-in zoom-in duration-300" />
                  ) : processingStage === 2 ? (
                    <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 text-brand-primary animate-pulse" />
                  ) : processingStage === 1 ? (
                    <Lock className="w-8 h-8 sm:w-9 sm:h-9 text-brand-primary animate-pulse" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-brand-primary animate-pulse" />
                  )}
                </div>
              </div>

              {/* Title & Dynamic Status Message */}
              <div className="space-y-1.5 text-center">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-brand-dark flex items-center justify-center gap-1.5">
                  <span>{processingStage === 3 ? "Order Confirmed!" : "Processing Your Order"}</span>
                  {processingStage !== 3 && (
                    <span className="inline-flex text-brand-primary font-mono text-xl">
                      <span className="animate-bounce [animation-delay:0ms]">.</span>
                      <span className="animate-bounce [animation-delay:150ms]">.</span>
                      <span className="animate-bounce [animation-delay:300ms]">.</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-brand-dark/70 font-medium transition-all duration-300">
                  {processingStage === 3 
                    ? "Redirecting to your order confirmation & receipt..." 
                    : PROCESSING_STEPS[processingStage]?.desc || "Finalizing order..."}
                </p>
              </div>

              {/* Progress Bar with Shimmer Wave */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold text-brand-dark/50 px-1">
                  <span className="uppercase tracking-wider">
                    {processingStage === 3 ? "Finalizing" : PROCESSING_STEPS[processingStage]?.title || "Processing"}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2.5 bg-brand-dark/10 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary via-brand-accent to-emerald-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Step indicator pills */}
              <div className="grid grid-cols-3 gap-2 w-full pt-1">
                {PROCESSING_STEPS.map((step, idx) => {
                  const isDone = processingStage > idx || processingStage === 3;
                  const isCurrent = processingStage === idx && processingStage !== 3;
                  return (
                    <div 
                      key={step.title}
                      className={`px-2 py-2 rounded-xl border text-[10px] sm:text-[11px] font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                        isDone 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs" 
                          : isCurrent 
                            ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-xs ring-1 ring-brand-primary/20" 
                            : "bg-brand-dark/[0.02] border-brand-dark/10 text-brand-dark/40"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-brand-dark/10 text-[9px] flex items-center justify-center font-mono">{idx + 1}</span>
                        )}
                        <span className="truncate">{step.short}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security Trust Badges */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-brand-dark/50 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-Bit SSL Encrypted • Safe & Instant Delivery</span>
              </div>

            </div>
          </div>
        )}

        {/* Popup Window Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {!product ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto border border-brand-primary/20">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-2xl text-brand-dark">Your Cart is Empty</h3>
              <p className="text-sm text-brand-dark/60">
                Please select an asset or product from our catalog to proceed with your order.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold font-mono text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Browse Store Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Customer & Payment Details (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer Details */}
                <section className="bg-white border border-brand-dark/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2.5 text-brand-dark">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/15 text-brand-primary font-mono font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    Customer Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-brand-dark/65 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-brand-dark/65 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com" 
                        className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" 
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Payment Section (When not auto-approved / free) */}
                {!product.autoApprove && (
                  <section className="bg-white border border-brand-dark/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2.5 text-brand-dark">
                      <span className="w-6 h-6 rounded-full bg-brand-primary/15 text-brand-primary font-mono font-bold flex items-center justify-center text-xs">
                        2
                      </span>
                      Payment Method
                    </h3>
                  
                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {(["wise", "paypal", "upi"] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(method);
                            setCopied(false);
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold capitalize transition-all cursor-pointer ${
                            paymentMethod === method 
                              ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-xs" 
                              : "bg-brand-dark/[0.02] border-brand-dark/10 text-brand-dark/60 hover:bg-brand-dark/5"
                          }`}
                        >
                          {paymentDetails[method].name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-brand-dark/[0.02] p-5 rounded-xl border border-brand-dark/5">
                      {paymentMethod === "upi" ? (
                        <div className="w-full flex flex-col items-center justify-center py-8 text-center space-y-3">
                          <h4 className="font-display font-bold text-xl text-brand-dark">Coming Soon</h4>
                          <p className="text-xs sm:text-sm text-brand-dark/60 font-medium">UPI payments are currently being set up.</p>
                          <button 
                            type="button"
                            onClick={() => {
                              handleClose();
                              navigate("/contact");
                            }} 
                            className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-accent transition-colors"
                          >
                            Contact now if you want to buy
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* QR Code */}
                          <div className="shrink-0 w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-xl border border-brand-dark/10 flex items-center justify-center shadow-xs overflow-hidden p-2">
                             <img src={paymentDetails[paymentMethod].qrCode} alt={`${paymentMethod} QR Code`} className="w-full h-full object-contain rounded-lg" />
                          </div>

                          <div className="flex-1 space-y-4 w-full text-center sm:text-left">
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium text-brand-dark/60">Amount to pay</p>
                              <p className="font-display font-bold text-2xl sm:text-3xl text-brand-dark">{paymentDetails[paymentMethod].amount}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-medium text-brand-dark/60">Scan QR or pay to {paymentMethod.toUpperCase()} ID:</p>
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <code className="bg-white border border-brand-dark/10 px-3 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-bold text-brand-primary select-all">
                                  {paymentDetails[paymentMethod].id}
                                </code>
                                <button 
                                  type="button"
                                  onClick={handleCopyId}
                                  className="p-2 rounded-lg border border-brand-dark/10 hover:bg-brand-dark/5 text-brand-dark/60 transition-colors cursor-pointer"
                                  title={`Copy ${paymentMethod.toUpperCase()} ID`}
                                >
                                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 text-xs text-brand-dark/70 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-left leading-relaxed">{paymentDetails[paymentMethod].instruction}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* 3. Upload Payment Screenshot (When not free) */}
                {!product.autoApprove && (
                  <section className="bg-white border border-brand-dark/10 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2.5 text-brand-dark">
                      <span className="w-6 h-6 rounded-full bg-brand-primary/15 text-brand-primary font-mono font-bold flex items-center justify-center text-xs">
                        3
                      </span>
                      Upload Screenshot *
                    </h3>

                    {!screenshotPreview ? (
                      <div 
                        className="w-full border-2 border-dashed border-brand-dark/15 hover:border-brand-primary/50 transition-colors rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 bg-brand-dark/[0.01] cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-12 h-12 bg-white shadow-xs border border-brand-dark/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-brand-dark/40 group-hover:text-brand-primary transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-sans font-bold text-xs sm:text-sm text-brand-dark">Click to upload payment screenshot</p>
                          <p className="text-[11px] text-brand-dark/50 font-medium">Supported formats: JPG, PNG, WEBP (Max 5 MB)</p>
                        </div>
                        <button 
                          type="button"
                          className="mt-1 px-4 py-1.5 bg-white border border-brand-dark/10 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-dark/60 group-hover:text-brand-dark transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    ) : (
                      <div className="w-full bg-brand-dark/[0.02] border border-brand-dark/10 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative">
                        <div className="w-28 h-28 rounded-lg overflow-hidden border border-brand-dark/10 shadow-xs">
                          <img src={screenshotPreview || undefined} alt="Payment Screenshot" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-sans font-bold text-xs sm:text-sm text-emerald-600 flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" /> Screenshot attached successfully
                          </p>
                          <p className="text-xs text-brand-dark/50 font-medium break-all px-4">{screenshot?.name}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={clearScreenshot}
                          className="px-4 py-1.5 bg-white border border-brand-dark/10 rounded-lg text-xs font-bold uppercase tracking-wider text-brand-dark/60 hover:text-brand-dark transition-colors cursor-pointer"
                        >
                          Change File
                        </button>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden" 
                    />
                  </section>
                )}

                {/* Submit Order Action Area */}
                <div className="pt-2 space-y-3.5">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm font-medium p-3.5 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={handleOrderSubmit}
                    disabled={!isFormValid || isSubmitting} 
                    className={`relative overflow-hidden w-full font-bold font-mono text-xs sm:text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all ${
                      (isFormValid && !isSubmitting)
                        ? "bg-brand-primary hover:bg-brand-accent text-white hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]" 
                        : isSubmitting
                          ? "bg-gradient-to-r from-brand-primary to-brand-accent text-white cursor-wait shadow-md"
                          : "bg-brand-primary opacity-50 cursor-not-allowed text-white"
                    }`}
                  >
                    {isSubmitting && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                    )}
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white relative z-10" />
                        <span className="relative z-10 flex items-center gap-1">
                          Processing Order
                          <span className="inline-flex">
                            <span className="animate-bounce [animation-delay:0ms]">.</span>
                            <span className="animate-bounce [animation-delay:150ms]">.</span>
                            <span className="animate-bounce [animation-delay:300ms]">.</span>
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Submit Order</span>
                      </>
                    )}
                  </button>
                  
                  {/* Verification Notice */}
                  {!product.autoApprove && (
                    <div className="flex items-start justify-center gap-2 text-xs font-medium text-brand-dark/50 px-3 text-center">
                      <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p>Payments are manually verified within 1 hour. After verification, download link and receipt will be sent to your email.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-brand-dark/10 rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-0">
                  <div className="p-5 sm:p-6 bg-brand-dark/[0.02] border-b border-brand-dark/10">
                    <h3 className="font-display font-bold text-lg text-brand-dark">Order Summary</h3>
                  </div>
                  
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Secure Checkout Notice */}
                    {!product.autoApprove && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-bold text-emerald-900 m-0">Secure Checkout</p>
                          <p className="text-emerald-800 m-0 text-[11px] mt-0.5 leading-relaxed">
                            Your payment information is encrypted and securely processed.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Product Card */}
                    <div className="flex gap-3.5 items-start">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-brand-dark/10 bg-brand-dark/[0.02] shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-brand-dark/20" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-display font-bold text-base sm:text-lg leading-tight text-brand-dark truncate">
                          {product.name}
                        </h4>
                        <div className="inline-block px-2 py-0.5 bg-brand-dark/[0.05] rounded text-[10px] font-mono font-bold text-brand-dark/60 uppercase tracking-widest">
                          V 1.0
                        </div>
                        {product.autoApprove ? (
                          <p className="font-bold text-emerald-600 text-sm pt-0.5">FREE</p>
                        ) : (
                          <p className="font-bold text-brand-primary text-sm pt-0.5">${product.price.toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-brand-dark/5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">Included</p>
                        <ul className="space-y-1.5">
                          {product.features.slice(0, 4).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs font-medium text-brand-dark/70">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Badges / Notes */}
                    <div className="space-y-2.5 pt-4 border-t border-brand-dark/10">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Download className="w-4 h-4 text-emerald-600" />
                         </div>
                         <div className="space-y-0.5 min-w-0">
                           <p className="text-xs font-bold text-brand-dark">Instant Download</p>
                           <p className="text-[10px] text-brand-dark/60 font-medium">Link delivered via email after verification</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-dark/[0.02] border border-brand-dark/5">
                         <div className="w-8 h-8 rounded-full bg-brand-dark/5 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-brand-dark/60" />
                         </div>
                         <div className="space-y-0.5 min-w-0">
                           <p className="text-xs font-bold text-brand-dark">Lifetime Updates</p>
                           <p className="text-[10px] text-brand-dark/60 font-medium">Free access to all future versions</p>
                         </div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="pt-4 border-t border-brand-dark/10 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-brand-dark/60">
                        <span>Subtotal</span>
                        <span className={product.autoApprove ? "line-through" : ""}>
                          ${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-display font-bold text-lg sm:text-xl text-brand-dark">
                        <span>Total</span>
                        {product.autoApprove ? (
                          <span className="text-emerald-600 font-extrabold">FREE</span>
                        ) : (
                          <span>${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}</span>
                        )}
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
